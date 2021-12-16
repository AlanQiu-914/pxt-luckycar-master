/**
 * Well known colors for a NeoPixel strip
 */
enum NeoPixelColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

/**
 * Different modes for RGB or RGB+W NeoPixel strips
 */
enum NeoPixelMode {
    //% block="RGB (GRB format)"
    RGB = 1,
    //% block="RGB+W"
    RGBW = 2,
    //% block="RGB (RGB format)"
    RGB_RGB = 3
}


const enum IrButton {
    //% block="A"
    A_key = 0xA2,
    //% block="B"
    B_key = 0x62,
    //% block="C"
    C_key = 0xE2,
    //% block="D"
    D_key = 0x22,
    //% block="▲"
    Up = 0x02,
    //% block="E"
    E_key = 0xC2,
    //% block="◀"
    Left = 0xE0,
    //% block="⚙"
    Ok = 0xA8,
    //% block="▶"
    Right = 0x90,
    //% block="0"
    Number_0 = 0x68,
    //% block="▼"
    Down = 0x98,
    //% block="F"
    F_key = 0xB0,
    //% block="1"
    Number_1 = 0x30,
    //% block="2"
    Number_2 = 0x18,
    //% block="3"
    Number_3 = 0x7A,
    //% block="4"
    Number_4 = 0x10,
    //% block="5"
    Number_5 = 0x38,
    //% block="6"
    Number_6 = 0x5A,
    //% block="7"
    Number_7 = 0x42,
    //% block="8"
    Number_8 = 0x4A,
    //% block="9"
    Number_9 = 0x52,
}
const enum IrButtonAction {
    //% block="pressed"
    Pressed = 0,
    //% block="released"
    Released = 1,
}
const enum IrProtocol {
    //% block="Keyestudio"
    Keyestudio = 0,
    //% block="NEC"
    NEC = 1,
}
namespace luckycar {
    /**
     * IR receiver
     */
    export namespace background {

        export enum Thread {
            Priority = 0,
            UserCallback = 1,
        }

        export enum Mode {
            Repeat,
            Once,
        }

        class Executor {
            _newJobs: Job[] = undefined;
            _jobsToRemove: number[] = undefined;
            _pause: number = 100;
            _type: Thread;

            constructor(type: Thread) {
                this._type = type;
                this._newJobs = [];
                this._jobsToRemove = [];
                control.runInParallel(() => this.loop());
            }

            push(task: () => void, delay: number, mode: Mode): number {
                if (delay > 0 && delay < this._pause && mode === Mode.Repeat) {
                    this._pause = Math.floor(delay);
                }
                const job = new Job(task, delay, mode);
                this._newJobs.push(job);
                return job.id;
            }

            cancel(jobId: number) {
                this._jobsToRemove.push(jobId);
            }

            loop(): void {
                const _jobs: Job[] = [];

                let previous = control.millis();

                while (true) {
                    const now = control.millis();
                    const delta = now - previous;
                    previous = now;

                    // Add new jobs
                    this._newJobs.forEach(function (job: Job, index: number) {
                        _jobs.push(job);
                    });
                    this._newJobs = [];

                    // Cancel jobs
                    this._jobsToRemove.forEach(function (jobId: number, index: number) {
                        for (let i = _jobs.length - 1; i >= 0; i--) {
                            const job2 = _jobs[i];
                            if (job2.id == jobId) {
                                _jobs.removeAt(i);
                                break;
                            }
                        }
                    });
                    this._jobsToRemove = []


                    // Execute all jobs
                    if (this._type === Thread.Priority) {
                        // newest first
                        for (let j = _jobs.length - 1; j >= 0; j--) {
                            if (_jobs[j].run(delta)) {
                                this._jobsToRemove.push(_jobs[j].id)
                            }
                        }
                    } else {
                        // Execute in order of schedule
                        for (let k = 0; k < _jobs.length; k++) {
                            if (_jobs[k].run(delta)) {
                                this._jobsToRemove.push(_jobs[k].id)
                            }
                        }
                    }

                    basic.pause(this._pause);
                }
            }
        }

        class Job {
            id: number;
            func: () => void;
            delay: number;
            remaining: number;
            mode: Mode;

            constructor(func: () => void, delay: number, mode: Mode) {
                this.id = randint(0, 2147483647)
                this.func = func;
                this.delay = delay;
                this.remaining = delay;
                this.mode = mode;
            }

            run(delta: number): boolean {
                if (delta <= 0) {
                    return false;
                }

                this.remaining -= delta;
                if (this.remaining > 0) {
                    return false;
                }

                switch (this.mode) {
                    case Mode.Once:
                        this.func();
                        basic.pause(0);
                        return true;
                    case Mode.Repeat:
                        this.func();
                        this.remaining = this.delay;
                        basic.pause(0);
                        return false;
                }
            }
        }

        const queues: Executor[] = [];

        export function schedule(
            func: () => void,
            type: Thread,
            mode: Mode,
            delay: number,
        ): number {
            if (!func || delay < 0) return 0;

            if (!queues[type]) {
                queues[type] = new Executor(type);
            }

            return queues[type].push(func, delay, mode);
        }

        export function remove(type: Thread, jobId: number): void {
            if (queues[type]) {
                queues[type].cancel(jobId);
            }
        }
    }
    ///////////////////////
    let irState: IrState;

    const IR_REPEAT = 256;
    const IR_INCOMPLETE = 257;
    const IR_DATAGRAM = 258;

    const REPEAT_TIMEOUT_MS = 120;

    interface IrState {
        protocol: IrProtocol;
        hasNewDatagram: boolean;
        bitsReceived: uint8;
        addressSectionBits: uint16;
        commandSectionBits: uint16;
        hiword: uint16;
        loword: uint16;
        activeCommand: number;
        repeatTimeout: number;
        onIrButtonPressed: IrButtonHandler[];
        onIrButtonReleased: IrButtonHandler[];
        onIrDatagram: () => void;
    }
    class IrButtonHandler {
        irButton: IrButton;
        onEvent: () => void;

        constructor(
            irButton: IrButton,
            onEvent: () => void
        ) {
            this.irButton = irButton;
            this.onEvent = onEvent;
        }
    }


    function appendBitToDatagram(bit: number): number {
        irState.bitsReceived += 1;

        if (irState.bitsReceived <= 8) {
            irState.hiword = (irState.hiword << 1) + bit;
            if (irState.protocol === IrProtocol.Keyestudio && bit === 1) {
                // recover from missing message bits at the beginning
                // Keyestudio address is 0 and thus missing bits can be detected
                // by checking for the first inverse address bit (which is a 1)
                irState.bitsReceived = 9;
                irState.hiword = 1;
            }
        } else if (irState.bitsReceived <= 16) {
            irState.hiword = (irState.hiword << 1) + bit;
        } else if (irState.bitsReceived <= 32) {
            irState.loword = (irState.loword << 1) + bit;
        }

        if (irState.bitsReceived === 32) {
            irState.addressSectionBits = irState.hiword & 0xffff;
            irState.commandSectionBits = irState.loword & 0xffff;
            return IR_DATAGRAM;
        } else {
            return IR_INCOMPLETE;
        }
    }

    function decode(markAndSpace: number): number {
        if (markAndSpace < 1600) {
            // low bit
            return appendBitToDatagram(0);
        } else if (markAndSpace < 2700) {
            // high bit
            return appendBitToDatagram(1);
        }

        irState.bitsReceived = 0;

        if (markAndSpace < 12500) {
            // Repeat detected
            return IR_REPEAT;
        } else if (markAndSpace < 14500) {
            // Start detected
            return IR_INCOMPLETE;
        } else {
            return IR_INCOMPLETE;
        }
    }

    function enableIrMarkSpaceDetection(pin: DigitalPin) {
        pins.setPull(pin, PinPullMode.PullNone);

        let mark = 0;
        let space = 0;

        pins.onPulsed(pin, PulseValue.Low, () => {
            // HIGH, see https://github.com/microsoft/pxt-microbit/issues/1416
            mark = pins.pulseDuration();
        });

        pins.onPulsed(pin, PulseValue.High, () => {
            // LOW
            space = pins.pulseDuration();
            const status = decode(mark + space);

            if (status !== IR_INCOMPLETE) {
                handleIrEvent(status);
            }
        });
    }

    function handleIrEvent(irEvent: number) {

        // Refresh repeat timer
        if (irEvent === IR_DATAGRAM || irEvent === IR_REPEAT) {
            irState.repeatTimeout = input.runningTime() + REPEAT_TIMEOUT_MS;
        }

        if (irEvent === IR_DATAGRAM) {
            irState.hasNewDatagram = true;

            if (irState.onIrDatagram) {
                background.schedule(irState.onIrDatagram, background.Thread.UserCallback, background.Mode.Once, 0);
            }

            const newCommand = irState.commandSectionBits >> 8;

            // Process a new command
            if (newCommand !== irState.activeCommand) {

                if (irState.activeCommand >= 0) {
                    const releasedHandler = irState.onIrButtonReleased.find(h => h.irButton === irState.activeCommand || IrButton.A_key === h.irButton);
                    if (releasedHandler) {
                        background.schedule(releasedHandler.onEvent, background.Thread.UserCallback, background.Mode.Once, 0);
                    }
                }

                const pressedHandler = irState.onIrButtonPressed.find(h => h.irButton === newCommand || IrButton.A_key === h.irButton);
                if (pressedHandler) {
                    background.schedule(pressedHandler.onEvent, background.Thread.UserCallback, background.Mode.Once, 0);
                }

                irState.activeCommand = newCommand;
            }
        }
    }

    function initIrState() {
        if (irState) {
            return;
        }

        irState = {
            protocol: undefined,
            bitsReceived: 0,
            hasNewDatagram: false,
            addressSectionBits: 0,
            commandSectionBits: 0,
            hiword: 0, // TODO replace with uint32
            loword: 0,
            activeCommand: -1,
            repeatTimeout: 0,
            onIrButtonPressed: [],
            onIrButtonReleased: [],
            onIrDatagram: undefined,
        };
    }
    ///////////////////////
    /**
    * Connects to the IR receiver module at the specified pin and configures the IR protocol.
    * @param pin IR receiver pin, eg: DigitalPin.P0
    * @param protocol IR protocol, eg: IrProtocol.Keyestudio
    */
    //% subcategory="IR Receiver"
    //% blockId="luckycar_infrared_connect_receiver"
    //% block="connect IR receiver at pin P2"
    //% pin.fieldEditor="gridpicker"
    //% pin.fieldOptions.columns=4
    //% pin.fieldOptions.tooltips="false"
    //% weight=90
    export function connectIrReceiver(): void {
        initIrState();

        if (irState.protocol) {
            return;
        }

        irState.protocol = IrProtocol.Keyestudio;

        enableIrMarkSpaceDetection(DigitalPin.P2);

        background.schedule(notifyIrEvents, background.Thread.Priority, background.Mode.Repeat, REPEAT_TIMEOUT_MS);
    }

    function notifyIrEvents() {
        if (irState.activeCommand === -1) {
            // skip to save CPU cylces
        } else {
            const now2 = input.runningTime();
            if (now2 > irState.repeatTimeout) {
                // repeat timed out

                const handler = irState.onIrButtonReleased.find(h => h.irButton === irState.activeCommand || IrButton.A_key === h.irButton);
                if (handler) {
                    background.schedule(handler.onEvent, background.Thread.UserCallback, background.Mode.Once, 0);
                }

                irState.bitsReceived = 0;
                irState.activeCommand = -1;
            }
        }
    }
    /**
       * Do something when a specific button is pressed or released on the remote control.
       * @param button the button to be checked
       * @param action the trigger action
       * @param handler body code to run when the event is raised
       */
    //% subcategory="IR Receiver"
    //% blockId=luckycar_infrared_on_ir_button
    //% block="on IR button | %button | %action"
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.columns=3
    //% button.fieldOptions.tooltips="false"
    //% weight=50
    export function onIrButton(
        button: IrButton,
        action: IrButtonAction,
        handler: () => void
    ) {
        initIrState();
        if (action === IrButtonAction.Pressed) {
            irState.onIrButtonPressed.push(new IrButtonHandler(button, handler));
        }
        else {
            irState.onIrButtonReleased.push(new IrButtonHandler(button, handler));
        }
    }
    
    /**
       * Returns the code of the IR button that was pressed last. Returns -1 (IrButton.Any) if no button has been pressed yet.
       */
    // subcategory="IR Receiver"
    // blockId=luckycar_infrared_ir_button_pressed
    // block="IR button"
    // weight=70
    /*
    export function irButton(): number {
        basic.pause(0); // Yield to support background processing when called in tight loops
        if (!irState) {
            return IrButton.A_key;
        }
        return irState.commandSectionBits >> 8;
    }
    */
    /**
     * Do something when an IR datagram is received.
     * @param handler body code to run when the event is raised
     */
    // subcategory="IR Receiver"
    // blockId=luckycar_infrared_on_ir_datagram
    // block="on IR datagram received"
    // weight=40
    /*
    export function onIrDatagram(handler: () => void) {
        initIrState();
        irState.onIrDatagram = handler;
    }
    */
    /**
     * Returns the IR datagram as 32-bit hexadecimal string.
     * The last received datagram is returned or "0x00000000" if no data has been received yet.
     */
    // subcategory="IR Receiver"
    // blockId=luckycar_infrared_ir_datagram
    // block="IR datagram"
    // weight=30
    /*
    export function irDatagram(): string {
        basic.pause(0); // Yield to support background processing when called in tight loops
        initIrState();
        return (
            "0x" +
            ir_rec_to16BitHex(irState.addressSectionBits) +
            ir_rec_to16BitHex(irState.commandSectionBits)
        );
    }
    */
    /**
     * Returns true if any IR data was received since the last call of this function. False otherwise.
     */
    // subcategory="IR Receiver"
    // blockId=luckycar_infrared_was_any_ir_datagram_received
    // block="IR data was received"
    // weight=80
    /*
    export function wasIrDataReceived(): boolean {
        basic.pause(0); // Yield to support background processing when called in tight loops
        initIrState();
        if (irState.hasNewDatagram) {
            irState.hasNewDatagram = false;
            return true;
        } else {
            return false;
        }
    }
    */
    /**
     * Returns the command code of a specific IR button.
     * @param button the button
     */
    // subcategory="IR Receiver"
    // blockId=luckycar_infrared_button_code
    // button.fieldEditor="gridpicker"
    // button.fieldOptions.columns=3
    // button.fieldOptions.tooltips="false"
    // block="IR button code %button"
    // weight=60
    /*
    export function irButtonCode(button: IrButton): number {
        basic.pause(0); // Yield to support background processing when called in tight loops
        return button as number;
    }
    */
    function ir_rec_to16BitHex(value: number): string {
        let hex = "";
        for (let pos = 0; pos < 4; pos++) {
            let remainder = value % 16;
            if (remainder < 10) {
                hex = remainder.toString() + hex;
            } else {
                hex = String.fromCharCode(55 + remainder) + hex;
            }
            value = Math.idiv(value, 16);
        }
        return hex;
    }
    /**
     * RGB灯
     */
    export enum RgbNum {
        //% block="left_front"
        left_front = 4,
        //% block="right_front"
        right_front = 3,
        //% block="left_dowm"
        left_dowm = 2,
        //% block="right_dowm"
        right_dowm = 1,
        //% block="front_dowm"
        front_dowm = 0

    }

    export namespace neopixel {
        /**
         * A NeoPixel strip
         */
        export class Strip {
            buf: Buffer;
            pin: DigitalPin;
            // TODO: encode as bytes instead of 32bit
            brightness: number;
            start: number; // start offset in LED strip
            _length: number; // number of LEDs
            _mode: NeoPixelMode;
            _matrixWidth: number; // number of leds in a matrix - if any

            /**
             * Shows all LEDs to a given color (range 0-255 for r, g, b).
             * @param rgb RGB color of the LED
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_set_strip_color" block="%strip|show color %rgb=neopixel_colors"
            //% strip.defl=strip
            //% weight=85 blockGap=8
            //% parts="neopixel"
            showColor(rgb: number) {
                rgb = rgb >> 0;
                this.setAllRGB(rgb);
                this.show();
            }

            /**
             * Shows a rainbow pattern on all LEDs.
             * @param startHue the start hue value for the rainbow, eg: 1
             * @param endHue the end hue value for the rainbow, eg: 360
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_set_strip_rainbow" block="%strip|show rainbow from %startHue|to %endHue"
            //% strip.defl=strip
            //% weight=85 blockGap=8
            //% parts="neopixel"
            showRainbow(startHue: number = 1, endHue: number = 360) {
                if (this._length <= 0) return;

                startHue = startHue >> 0;
                endHue = endHue >> 0;
                const saturation = 100;
                const luminance = 50;
                const steps = this._length;
                const direction = HueInterpolationDirection.Clockwise;

                //hue
                const h1 = startHue;
                const h2 = endHue;
                const hDistCW = ((h2 + 360) - h1) % 360;
                const hStepCW = Math.idiv((hDistCW * 100), steps);
                const hDistCCW = ((h1 + 360) - h2) % 360;
                const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
                let hStep: number;
                if (direction === HueInterpolationDirection.Clockwise) {
                    hStep = hStepCW;
                } else if (direction === HueInterpolationDirection.CounterClockwise) {
                    hStep = hStepCCW;
                } else {
                    hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
                }
                const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

                //sat
                const s1 = saturation;
                const s2 = saturation;
                const sDist = s2 - s1;
                const sStep = Math.idiv(sDist, steps);
                const s1_100 = s1 * 100;

                //lum
                const l1 = luminance;
                const l2 = luminance;
                const lDist = l2 - l1;
                const lStep = Math.idiv(lDist, steps);
                const l1_100 = l1 * 100

                //interpolate
                if (steps === 1) {
                    this.setPixelColor(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
                } else {
                    this.setPixelColor(0, hsl(startHue, saturation, luminance));
                    for (let i = 1; i < steps - 1; i++) {
                        const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                        const s = Math.idiv((s1_100 + i * sStep), 100);
                        const l = Math.idiv((l1_100 + i * lStep), 100);
                        this.setPixelColor(i, hsl(h, s, l));
                    }
                    this.setPixelColor(steps - 1, hsl(endHue, saturation, luminance));
                }
                this.show();
            }

            /**
             * Displays a vertical bar graph based on the `value` and `high` value.
             * If `high` is 0, the chart gets adjusted automatically.
             * @param value current value to plot
             * @param high maximum value, eg: 255
             */
            //% subcategory="RGB_CTR"
            //% weight=84
            //% blockId=neopixel_show_bar_graph block="%strip|show bar graph of %value|up to %high"
            //% strip.defl=strip
            //% icon="\uf080"
            //% parts="neopixel"
            showBarGraph(value: number, high: number): void {
                if (high <= 0) {
                    this.clear();
                    this.setPixelColor(0, NeoPixelColors.Yellow);
                    this.show();
                    return;
                }

                value = Math.abs(value);
                const n = this._length;
                const n1 = n - 1;
                let v = Math.idiv((value * n), high);
                if (v == 0) {
                    this.setPixelColor(0, 0x666600);
                    for (let i = 1; i < n; ++i)
                        this.setPixelColor(i, 0);
                } else {
                    for (let i = 0; i < n; ++i) {
                        if (i <= v) {
                            const b = Math.idiv(i * 255, n1);
                            this.setPixelColor(i, neopixel.rgb(b, 0, 255 - b));
                        }
                        else this.setPixelColor(i, 0);
                    }
                }
                this.show();
            }

            /**
             * Set LED to a given color (range 0-255 for r, g, b).
             * You need to call ``show`` to make the changes visible.
             * @param pixeloffset position of the NeoPixel in the strip
             * @param rgb RGB color of the LED
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_set_pixel_color" block="%strip|set pixel color at %pixeloffset|to %rgb=neopixel_colors"
            //% strip.defl=strip
            //% blockGap=8
            //% weight=80
            //% parts="neopixel" advanced=true
            setPixelColor(pixeloffset: number, rgb: number): void {
                this.setPixelRGB(pixeloffset >> 0, rgb >> 0);
            }

            /**
             * Sets the number of pixels in a matrix shaped strip
             * @param width number of pixels in a row
             */
            //% subcategory="RGB_CTR"
            //% blockId=neopixel_set_matrix_width block="%strip|set matrix width %width"
            //% strip.defl=strip
            //% blockGap=8
            //% weight=5
            //% parts="neopixel" advanced=true
            setMatrixWidth(width: number) {
                this._matrixWidth = Math.min(this._length, width >> 0);
            }

            /**
             * Set LED to a given color (range 0-255 for r, g, b) in a matrix shaped strip
             * You need to call ``show`` to make the changes visible.
             * @param x horizontal position
             * @param y horizontal position
             * @param rgb RGB color of the LED
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_set_matrix_color" block="%strip|set matrix color at x %x|y %y|to %rgb=neopixel_colors"
            //% strip.defl=strip
            //% weight=4
            //% parts="neopixel" advanced=true
            setMatrixColor(x: number, y: number, rgb: number) {
                if (this._matrixWidth <= 0) return; // not a matrix, ignore
                x = x >> 0;
                y = y >> 0;
                rgb = rgb >> 0;
                const cols = Math.idiv(this._length, this._matrixWidth);
                if (x < 0 || x >= this._matrixWidth || y < 0 || y >= cols) return;
                let i = x + y * this._matrixWidth;
                this.setPixelColor(i, rgb);
            }

            /**
             * For NeoPixels with RGB+W LEDs, set the white LED brightness. This only works for RGB+W NeoPixels.
             * @param pixeloffset position of the LED in the strip
             * @param white brightness of the white LED
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_set_pixel_white" block="%strip|set pixel white LED at %pixeloffset|to %white"
            //% strip.defl=strip
            //% blockGap=8
            //% weight=80
            //% parts="neopixel" advanced=true
            setPixelWhiteLED(pixeloffset: number, white: number): void {
                if (this._mode === NeoPixelMode.RGBW) {
                    this.setPixelW(pixeloffset >> 0, white >> 0);
                }
            }

            /**
             * Send all the changes to the strip.
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_show" block="%strip|show" blockGap=8
            //% strip.defl=strip
            //% weight=79
            //% parts="neopixel"
            show() {
                // only supported in beta
                // ws2812b.setBufferMode(this.pin, this._mode);
                ws2812b.sendBuffer(this.buf, this.pin);
            }

            /**
             * Turn off all LEDs.
             * You need to call ``show`` to make the changes visible.
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_clear" block="%strip|clear"
            //% strip.defl=strip
            //% weight=76
            //% parts="neopixel"
            clear(): void {
                const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
                this.buf.fill(0, this.start * stride, this._length * stride);
            }

            /**
             * Gets the number of pixels declared on the strip
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_length" block="%strip|length" blockGap=8
            //% strip.defl=strip
            //% weight=60 advanced=true
            length() {
                return this._length;
            }

            /**
             * Set the brightness of the strip. This flag only applies to future operation.
             * @param brightness a measure of LED brightness in 0-255. eg: 255
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_set_brightness" block="%strip|set brightness %brightness" blockGap=8
            //% strip.defl=strip
            //% weight=59
            //% parts="neopixel" advanced=true
            setBrightness(brightness: number): void {
                this.brightness = brightness & 0xff;
            }

            /**
             * Apply brightness to current colors using a quadratic easing function.
             **/
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_each_brightness" block="%strip|ease brightness" blockGap=8
            //% strip.defl=strip
            //% weight=58
            //% parts="neopixel" advanced=true
            easeBrightness(): void {
                const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
                const br = this.brightness;
                const buf = this.buf;
                const end = this.start + this._length;
                const mid = Math.idiv(this._length, 2);
                for (let i = this.start; i < end; ++i) {
                    const k = i - this.start;
                    const ledoffset = i * stride;
                    const br = k > mid
                        ? Math.idiv(255 * (this._length - 1 - k) * (this._length - 1 - k), (mid * mid))
                        : Math.idiv(255 * k * k, (mid * mid));
                    const r = (buf[ledoffset + 0] * br) >> 8; buf[ledoffset + 0] = r;
                    const g = (buf[ledoffset + 1] * br) >> 8; buf[ledoffset + 1] = g;
                    const b = (buf[ledoffset + 2] * br) >> 8; buf[ledoffset + 2] = b;
                    if (stride == 4) {
                        const w = (buf[ledoffset + 3] * br) >> 8; buf[ledoffset + 3] = w;
                    }
                }
            }

            /**
             * Create a range of LEDs.
             * @param start offset in the LED strip to start the range
             * @param length number of LEDs in the range. eg: 4
             */
            //% subcategory="RGB_CTR"
            //% weight=89
            //% blockId="neopixel_range" block="%strip|range from %start|with %length|leds"
            //% strip.defl=strip
            //% parts="neopixel"
            //% blockSetVariable=range
            range(start: number, length: number): Strip {
                start = start >> 0;
                length = length >> 0;
                let strip = new Strip();
                strip.buf = this.buf;
                strip.pin = this.pin;
                strip.brightness = this.brightness;
                strip.start = this.start + Math.clamp(0, this._length - 1, start);
                strip._length = Math.clamp(0, this._length - (strip.start - this.start), length);
                strip._matrixWidth = 0;
                strip._mode = this._mode;
                return strip;
            }

            /**
             * Shift LEDs forward and clear with zeros.
             * You need to call ``show`` to make the changes visible.
             * @param offset number of pixels to shift forward, eg: 1
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_shift" block="%strip|shift pixels by %offset" blockGap=8
            //% strip.defl=strip
            //% weight=40
            //% parts="neopixel"
            shift(offset: number = 1): void {
                offset = offset >> 0;
                const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
                this.buf.shift(-offset * stride, this.start * stride, this._length * stride)
            }

            /**
             * Rotate LEDs forward.
             * You need to call ``show`` to make the changes visible.
             * @param offset number of pixels to rotate forward, eg: 1
             */
            //% subcategory="RGB_CTR"
            //% blockId="neopixel_rotate" block="%strip|rotate pixels by %offset" blockGap=8
            //% strip.defl=strip
            //% weight=39
            //% parts="neopixel"
            rotate(offset: number = 1): void {
                offset = offset >> 0;
                const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
                this.buf.rotate(-offset * stride, this.start * stride, this._length * stride)
            }

            /**
             * Set the pin where the neopixel is connected, defaults to P0.
             */
            //% subcategory="RGB_CTR"
            //% weight=10
            //% parts="neopixel" advanced=true
            setPin(pin: DigitalPin): void {
                this.pin = pin;
                pins.digitalWritePin(this.pin, 0);
                // don't yield to avoid races on initialization
            }

            /**
             * Estimates the electrical current (mA) consumed by the current light configuration.
             */
            //% subcategory="RGB_CTR"
            //% weight=9 blockId=neopixel_power block="%strip|power (mA)"
            //% strip.defl=strip
            //% advanced=true
            power(): number {
                const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
                const end = this.start + this._length;
                let p = 0;
                for (let i = this.start; i < end; ++i) {
                    const ledoffset = i * stride;
                    for (let j = 0; j < stride; ++j) {
                        p += this.buf[i + j];
                    }
                }
                return Math.idiv(this.length() * 7, 10) /* 0.7mA per neopixel */
                    + Math.idiv(p * 480, 10000); /* rought approximation */
            }

            private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
                if (this._mode === NeoPixelMode.RGB_RGB) {
                    this.buf[offset + 0] = red;
                    this.buf[offset + 1] = green;
                } else {
                    this.buf[offset + 0] = green;
                    this.buf[offset + 1] = red;
                }
                this.buf[offset + 2] = blue;
            }

            private setAllRGB(rgb: number) {
                let red = unpackR(rgb);
                let green = unpackG(rgb);
                let blue = unpackB(rgb);

                const br = this.brightness;
                if (br < 255) {
                    red = (red * br) >> 8;
                    green = (green * br) >> 8;
                    blue = (blue * br) >> 8;
                }
                const end = this.start + this._length;
                const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
                for (let i = this.start; i < end; ++i) {
                    this.setBufferRGB(i * stride, red, green, blue)
                }
            }
            private setAllW(white: number) {
                if (this._mode !== NeoPixelMode.RGBW)
                    return;

                let br = this.brightness;
                if (br < 255) {
                    white = (white * br) >> 8;
                }
                let buf = this.buf;
                let end = this.start + this._length;
                for (let i = this.start; i < end; ++i) {
                    let ledoffset = i * 4;
                    buf[ledoffset + 3] = white;
                }
            }
            private setPixelRGB(pixeloffset: number, rgb: number): void {
                if (pixeloffset < 0
                    || pixeloffset >= this._length)
                    return;

                let stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
                pixeloffset = (pixeloffset + this.start) * stride;

                let red = unpackR(rgb);
                let green = unpackG(rgb);
                let blue = unpackB(rgb);

                let br = this.brightness;
                if (br < 255) {
                    red = (red * br) >> 8;
                    green = (green * br) >> 8;
                    blue = (blue * br) >> 8;
                }
                this.setBufferRGB(pixeloffset, red, green, blue)
            }
            private setPixelW(pixeloffset: number, white: number): void {
                if (this._mode !== NeoPixelMode.RGBW)
                    return;

                if (pixeloffset < 0
                    || pixeloffset >= this._length)
                    return;

                pixeloffset = (pixeloffset + this.start) * 4;

                let br = this.brightness;
                if (br < 255) {
                    white = (white * br) >> 8;
                }
                let buf = this.buf;
                buf[pixeloffset + 3] = white;
            }
        }

        /**
         * Create a new NeoPixel driver for `numleds` LEDs.
         * @param pin the pin where the neopixel is connected.
         * @param numleds number of leds in the strip, eg: 24,30,60,64
         */
        //% subcategory="RGB_CTR"
        //% blockId="neopixel_create" block="NeoPixel at pin %pin|with %numleds|leds as %mode"
        //% weight=90 blockGap=8
        //% parts="neopixel"
        //% trackArgs=0,2
        //% blockSetVariable=strip
        export function create(pin: DigitalPin, numleds: number, mode: NeoPixelMode): Strip {
            let strip = new Strip();
            let stride = mode === NeoPixelMode.RGBW ? 4 : 3;
            strip.buf = pins.createBuffer(numleds * stride);
            strip.start = 0;
            strip._length = numleds;
            strip._mode = mode || NeoPixelMode.RGB;
            strip._matrixWidth = 0;
            strip.setBrightness(128)
            strip.setPin(pin)
            return strip;
        }
        /**
         * rgb init DigitalPin.P0, 4 leds,NeoPixelMode.RGB
         */
        let carstrip = new Strip();
        //% subcategory="RGB_CTR"
        //% blockId="neopixel_car_rgb_init" block="Car Rgb Init"
        //% weight=100 blockGap=8
        //% parts="neopixel"
        export function car_rgb_init(): void {
            let stride = 3;
            carstrip.buf = pins.createBuffer(5 * stride);
            carstrip.start = 0;
            carstrip._length = 5;
            carstrip._mode = NeoPixelMode.RGB || NeoPixelMode.RGB;
            carstrip._matrixWidth = 0;
            carstrip.setBrightness(128)
            carstrip.setPin(DigitalPin.P16)
        }

        //% subcategory="RGB_CTR"
        //% blockId="neopixel_set_car_pixel_color" block="set car pixel color at %pixeloffset|to %rgb=neopixel_colors"
        //% blockGap=8
        //% weight=80
        //% parts="neopixel" advanced=true
        export function setCarPixelColor(pixeloffset: RgbNum, rgb: number): void {
            carstrip.setPixelColor(pixeloffset >> 0, rgb >> 0);
            carstrip.show();
        }

        /**
        * Set the brightness of the car rgb. This flag only applies to future operation.
        * @param brightness a measure of LED brightness in 0-255. eg: 255
        */
        //% subcategory="RGB_CTR"
        //% blockId="neopixel_set_car_brightness" block="set car rgb brightness %brightness" 
        //% brightness.min=0 brightness.max=255
        //% blockGap=8
        //% weight=80
        //% parts="neopixel" advanced=true
        export function setCarBrightness(brightness: number): void {
            carstrip.brightness = brightness & 0xff;
        }

        //% subcategory="RGB_CTR"
        //% blockId="neopixel_set_car_all_rgb" block="car rgb show color %rgb=neopixel_colors"
        //% blockGap=8
        //% weight=80
        //% parts="neopixel" advanced=true
        export function setCarRgbAll(rgb: number): void {
            carstrip.showColor(rgb >> 0);
        }

        /**
         * Converts red, green, blue channels into a RGB color
         * @param red value of the red channel between 0 and 255. eg: 255
         * @param green value of the green channel between 0 and 255. eg: 255
         * @param blue value of the blue channel between 0 and 255. eg: 255
         */
        //% subcategory="RGB_CTR"
        //% weight=1
        //% blockId="neopixel_rgb" block="red %red|green %green|blue %blue"
        //% advanced=true
        export function rgb(red: number, green: number, blue: number): number {
            return packRGB(red, green, blue);
        }

        /**
         * Gets the RGB value of a known color
        */
        //% subcategory="RGB_CTR"
        //% weight=2 blockGap=8
        //% blockId="neopixel_colors" block="%color"
        //% advanced=true
        export function colors(color: NeoPixelColors): number {
            return color;
        }

        function packRGB(a: number, b: number, c: number): number {
            return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
        }
        function unpackR(rgb: number): number {
            let r = (rgb >> 16) & 0xFF;
            return r;
        }
        function unpackG(rgb: number): number {
            let g = (rgb >> 8) & 0xFF;
            return g;
        }
        function unpackB(rgb: number): number {
            let b = (rgb) & 0xFF;
            return b;
        }

        /**
         * Converts a hue saturation luminosity value into a RGB color
         * @param h hue from 0 to 360
         * @param s saturation from 0 to 99
         * @param l luminosity from 0 to 99
         */
        //% subcategory="RGB_CTR"
        //% blockId=neopixelHSL block="hue %h|saturation %s|luminosity %l"
        export function hsl(h: number, s: number, l: number): number {
            h = Math.round(h);
            s = Math.round(s);
            l = Math.round(l);

            h = h % 360;
            s = Math.clamp(0, 99, s);
            l = Math.clamp(0, 99, l);
            let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
            let h1 = Math.idiv(h, 60);//[0,6]
            let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
            let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
            let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
            let r$: number;
            let g$: number;
            let b$: number;
            if (h1 == 0) {
                r$ = c; g$ = x; b$ = 0;
            } else if (h1 == 1) {
                r$ = x; g$ = c; b$ = 0;
            } else if (h1 == 2) {
                r$ = 0; g$ = c; b$ = x;
            } else if (h1 == 3) {
                r$ = 0; g$ = x; b$ = c;
            } else if (h1 == 4) {
                r$ = x; g$ = 0; b$ = c;
            } else if (h1 == 5) {
                r$ = c; g$ = 0; b$ = x;
            }
            let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
            let r = r$ + m;
            let g = g$ + m;
            let b = b$ + m;
            return packRGB(r, g, b);
        }

        export enum HueInterpolationDirection {
            Clockwise,
            CounterClockwise,
            Shortest
        }
    }


    /**
     * 小车马达、循迹控制
     */

    let _initEvents_center = true
    let _initEvents_side = true
    /**
    * Unit of Ultrasound Module
    */
    export enum SonarUnit {
        //% block="cm"
        Centimeters,
        //% block="inches"
        Inches
    }
    /**
    * Select the motor on the left or right
    */
    export enum MotorsList {
        //% blockId="M1" block="M1"
        M1 = 0,
        //% blockId="M2" block="M2"
        M2 = 1
    }

    export enum Direction {
        //% block="Forward" enumval=0
        forward,
        //% block="Backward" enumval=1
        backward,
        //% block="Left" enumval=2
        left,
        //% block="Right" enumval=3
        right
    }

    export enum BrightnessChoice {
        //% block="Left" enumval=0
        Left,
        //% block="Right" enumval=1
        Right
    }
    /**
     * Pins used to generate events
     */
    export enum CenterTrackPins {
        //% block="Center_Left"
        Center_Left = EventBusSource.MICROBIT_ID_IO_P15,
        //% block="Center_Right"
        Center_Right = EventBusSource.MICROBIT_ID_IO_P11
    }

    /**
     * Pins used to generate events
     */
    export enum SideTrackPins {
        //% block="Side_Left"
        Side_Left = EventBusSource.MICROBIT_ID_IO_P7,
        //% block="Side_Right"
        Side_Right = EventBusSource.MICROBIT_ID_IO_P6
    }
    /**
    * Line Sensor events    MICROBIT_PIN_EVT_RISE
    */
    export enum TrackEvents {
        //% block="Found" 
        FindLine = EventBusValue.MICROBIT_PIN_EVT_FALL,
        //% block="Lost" 
        LoseLine = EventBusValue.MICROBIT_PIN_EVT_RISE
    }
    /**
     * Pins used to generate events
     */
    export enum TrackPinsNum {
        //% block="Center_Left"
        Center_Left = 0,
        //% block="Center_Right"
        Center_Right = 1,
        //% block="Side_Left"
        Side_Left = 2,
        //% block="Side_Right"
        Side_Right = 3
    }
    /**
    * Line Sensor state    
    */
    export enum TrackState {
        //% block="Found" 
        FindLine = 0,
        //% block="Lost" 
        LoseLine = 1
    }


    /**
    * Status List of Center Tracking Modules
    */
    export enum CenterTrackingState {
        //% block="● ●" enumval=0
        C_L_R_line,

        //% block="◌ ●" enumval=1
        C_L_unline_R_line,

        //% block="● ◌" enumval=2
        C_L_line_R_unline,

        //% block="◌ ◌" enumval=3
        C_L_R_unline
    }
    /**
    * Status List of Side Tracking Modules
    */
    export enum SideTrackingState {
        //% block="● ●" enumval=0
        S_L_R_line,

        //% block="◌ ●" enumval=1
        S_L_unline_R_line,

        //% block="● ◌" enumval=2
        S_L_line_R_unline,

        //% block="◌ ◌" enumval=3
        S_L_R_unline
    }

    /**
     * TODO: Set the speed of left and right wheels. 
     * @param lspeed Left wheel speed , eg: 100
     * @param rspeed Right wheel speed, eg: -100
     */
    //% blockId=MotorRun block="Set left wheel speed %lspeed\\% |right wheel speed %rspeed\\%"
    //% lspeed.min=-100 lspeed.max=100
    //% rspeed.min=-100 rspeed.max=100
    //% weight=100
    export function motors(lspeed: number = 50, rspeed: number = 50): void {
        if (lspeed > 100) {
            lspeed = 100;
        } else if (lspeed < -100) {
            lspeed = -100;
        }
        if (rspeed > 100) {
            rspeed = 100;
        } else if (rspeed < -100) {
            rspeed = -100;
        }

        if (lspeed >= 0) {
            pins.analogWritePin(AnalogPin.P0, lspeed == 100 ? 1023 : (lspeed * 1024) / 100);
            pins.digitalWritePin(DigitalPin.P12, 0);
        }
        else {
            lspeed = Math.abs(lspeed);
            pins.analogWritePin(AnalogPin.P0, ((100 - lspeed) * 1024) / 100);
            pins.digitalWritePin(DigitalPin.P12, 1);
        }
        if (rspeed >= 0) {
            pins.analogWritePin(AnalogPin.P1, rspeed == 100 ? 1023 : (rspeed * 1024) / 100);
            pins.digitalWritePin(DigitalPin.P8, 0);
        }
        else {
            rspeed = Math.abs(rspeed);
            pins.analogWritePin(AnalogPin.P1, ((100 - rspeed) * 1024) / 100);
            pins.digitalWritePin(DigitalPin.P8, 1);
        }
    }
    /**
    * TODO: Full speed operation lasts for 10 seconds,speed is 100.
    * @param dir Driving direction, eg: Direction.forward
    * @param speed Running speed, eg: 50
    * @param time Travel time, eg: 5
    */
    //% blockId=luckycar_move_time block="Go %dir at speed%speed\\% for %time seconds"
    //% weight=95
    export function moveTime(dir: Direction, speed: number, time: number): void {
        if (dir == 0) {
            motors(speed, speed);
            basic.pause(time * 1000)
            motors(0, 0)
        }
        if (dir == 1) {
            motors(-speed, -speed);
            basic.pause(time * 1000)
            motors(0, 0)
        }
        if (dir == 2) {
            motors(-speed, speed);
            basic.pause(time * 1000)
            motors(0, 0)
        }
        if (dir == 3) {
            motors(speed, -speed);
            basic.pause(time * 1000)
            motors(0, 0)
        }
    }
    /**
    * TODO: full speed move forward,speed is 100.
    */
    //% blockId=Luckyebot_forward block="Go straight at full speed"
    //% weight=90
    export function forward(): void {
        pins.analogWritePin(AnalogPin.P0, 1023);
        pins.digitalWritePin(DigitalPin.P12, 0);

        pins.analogWritePin(AnalogPin.P1, 1023);
        pins.digitalWritePin(DigitalPin.P8, 0);
    }


    /**
    * TODO: full speed move back,speed is -100.
    */
    //% blockId=luckycar_back block="Reverse at full speed"
    //% weight=85
    export function backforward(): void {
        pins.analogWritePin(AnalogPin.P0, 0);
        pins.digitalWritePin(DigitalPin.P12, 1);

        pins.analogWritePin(AnalogPin.P1, 0);
        pins.digitalWritePin(DigitalPin.P8, 1);

    }
    /**
    * TODO: full speed turnleft.
    */
    //% blockId=luckycar_left block="Turn left at full speed"
    //% weight=80
    export function turnleft(): void {
        pins.analogWritePin(AnalogPin.P0, 1023);
        pins.digitalWritePin(DigitalPin.P12, 0);

        pins.analogWritePin(AnalogPin.P1, 0);
        pins.digitalWritePin(DigitalPin.P8, 1);
    }
    /**
    * TODO: full speed turnright.
    */
    //% blockId=luckycar_right block="Turn right at full speed"
    //% weight=75
    export function turnright(): void {
        pins.analogWritePin(AnalogPin.P0, 0);
        pins.digitalWritePin(DigitalPin.P12, 1);

        pins.analogWritePin(AnalogPin.P1, 1023);
        pins.digitalWritePin(DigitalPin.P8, 0);
    }
    /**
    * TODO: stopcar
    */
    //% blockId=luckycar_stopcar block="Stop car immediatly"
    //% weight=70
    export function stopcar(): void {
        motors(0, 0)
    }

    /**
    * Judging the Current Status of Center Tracking Module. 
    * @param state Four states of Center tracking module, eg: TrackingState.C_L_R_line
    */
    //% blockId=ringbitcar_center_tracking block="Center tracking state is %state"
    //% weight=65
    export function centertracking(state: CenterTrackingState): boolean {
        pins.setPull(DigitalPin.P11, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp);
        let center_right_tracking = pins.digitalReadPin(DigitalPin.P11);
        let center_left_tracking = pins.digitalReadPin(DigitalPin.P15);
        if (center_left_tracking == 0 && center_right_tracking == 0 && state == 0) {
            return true;
        }
        else if (center_left_tracking == 1 && center_right_tracking == 0 && state == 1) {
            return true;
        }
        else if (center_left_tracking == 0 && center_right_tracking == 1 && state == 2) {
            return true;
        }
        else if (center_left_tracking == 1 && center_right_tracking == 1 && state == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
    * TODO: track one side
    * @param side Line sensor edge , eg: CenterTrackPins.Left
    * @param state Line sensor status, eg: TrackState.FindLine
    */
    //% block="Track %side line sensor %state"
    //% state.fieldEditor="gridpicker" state.fieldOptions.columns=2
    //% side.fieldEditor="gridpicker" side.fieldOptions.columns=2
    //% weight=60
    export function trackstatefun(side: TrackPinsNum, state: TrackState): boolean {
        pins.setPull(DigitalPin.P11, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P6, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P7, PinPullMode.PullUp);
        let center_right_tracking = pins.digitalReadPin(DigitalPin.P11);
        let center_left_tracking = pins.digitalReadPin(DigitalPin.P15);
        let side_right_tracking = pins.digitalReadPin(DigitalPin.P6);
        let side_left_tracking = pins.digitalReadPin(DigitalPin.P7);
        if (side == 0 && state == 1 && center_left_tracking == 1) {
            return true;
        }
        else if (side == 0 && state == 0 && center_left_tracking == 0) {
            return true;
        }
        else if (side == 1 && state == 1 && center_right_tracking == 1) {
            return true;
        }
        else if (side == 1 && state == 0 && center_right_tracking == 0) {
            return true;
        }
        else if (side == 2 && state == 1 && side_left_tracking == 1) {
            return true;
        }
        else if (side == 2 && state == 0 && side_left_tracking == 0) {
            return true;
        }
        else if (side == 3 && state == 1 && side_right_tracking == 1) {
            return true;
        }
        else if (side == 3 && state == 0 && side_right_tracking == 0) {
            return true;
        }
        else {
            return false;
        }
    }
    //side
    /**
    * Judging the Current Status of Center Tracking Module. 
    * @param state Four states of Center tracking module, eg: TrackingState.C_L_R_line
    */
    //% blockId=ringbitcar_side_tracking block="Side tracking state is %state"
    //% weight=60
    export function sidetracking(state: SideTrackingState): boolean {
        pins.setPull(DigitalPin.P6, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P7, PinPullMode.PullUp);
        let side_right_tracking = pins.digitalReadPin(DigitalPin.P6);
        let side_left_tracking = pins.digitalReadPin(DigitalPin.P7);
        if (side_left_tracking == 0 && side_right_tracking == 0 && state == 0) {
            return true;
        }
        else if (side_left_tracking == 1 && side_right_tracking == 0 && state == 1) {
            return true;
        }
        else if (side_left_tracking == 0 && side_right_tracking == 1 && state == 2) {
            return true;
        }
        else if (side_left_tracking == 1 && side_right_tracking == 1 && state == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    ///
    let distanceBackup: number = 0;
    /**
    * Cars can extend the ultrasonic function to prevent collisions and other functions.. 
    * @param Sonarunit two states of ultrasonic module, eg: Centimeters
    */
    //% blockId=ultrasonic block="HC-SR04 Sonar"
    //% weight=55
    export function ultrasonic(): number {
        let duration = 0;
        let RangeInCentimeters = 0;
        
        pins.digitalWritePin(DigitalPin.P14, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P14, 1);
        control.waitMicros(20);
        pins.digitalWritePin(DigitalPin.P14, 0);
        duration = pins.pulseIn(DigitalPin.P14, PulseValue.High, 50000); // Max duration 50 ms

        RangeInCentimeters = duration * 153 / 44 / 2 / 100 ;
               
        if(RangeInCentimeters > 0) distanceBackup = RangeInCentimeters;
        else RangeInCentimeters = distanceBackup;

        basic.pause(50);
        
        return RangeInCentimeters;
    }

    /**
    * Cars read brightness on Left and right
    */
    //% blockId=brightness block="%num Brightness value"
    //% weight=55
    export function brightness(num: BrightnessChoice): number {
        let mesuBrightness = 0;
        if(num == 0)
        {
            for(let i = 0;i < 6;i++)
            {
                mesuBrightness = mesuBrightness + pins.analogReadPin(AnalogPin.P10);
                basic.pause(10);
            }
            mesuBrightness = Math.round(mesuBrightness/10);
        }
        else if(num == 1)
        {
            for (let i = 0; i < 6; i++) {
                mesuBrightness = mesuBrightness + pins.analogReadPin(AnalogPin.P3);
                basic.pause(10);
            }
            mesuBrightness = Math.round(mesuBrightness / 10);
        }
        return (1024-mesuBrightness);
    }
    /**
    * TODO: Runs when line sensor finds or loses.
    */
    //% block="On Center %sensor| line %event"
    //%sensor.fieldEditor="gridpicker" sensor.fieldOptions.columns=2
    //%event.fieldEditor="gridpicker" event.fieldOptions.columns=2
    //% weight=50
    export function trackEventCenter(sensor: CenterTrackPins, event: TrackEvents, handler: Action) {
        initEvents_center();
        control.onEvent(<number>sensor, <number>event, handler);
    }

    /**
    * TODO: Runs when line sensor finds or loses.
    */
    //% block="On Side %sensor| line %event"
    //%sensor.fieldEditor="gridpicker" sensor.fieldOptions.columns=2
    //%event.fieldEditor="gridpicker" event.fieldOptions.columns=2
    //% weight=50
    export function trackEventSide(sensor: SideTrackPins, event: TrackEvents, handler: Action) {
        initEvents_side();
        control.onEvent(<number>sensor, <number>event, handler);
    }

    /**
     * TODO: Set the angle of servo. 
     * @param angle angle of servo, eg: 90
     */
    //% blockId=luckycar_servo block="Set servo angle to %angle °"
    //% angle.shadow="protractorPicker"
    //% weight=45
    export function setServo(angle: number = 180): void {
        pins.servoWritePin(AnalogPin.P4, angle)
    }

    /**
     * TODO: Set the AudioPin. 
     */
    //% blockId=luckycar_AudioPin block="Set AudioPin on P9"
    //% weight=40
    export function setAudionPinFixed(): void {
        pins.setAudioPin(AnalogPin.P13)
    }


    function initEvents_center(): void {
        if (_initEvents_center) {
            pins.setPull(DigitalPin.P11, PinPullMode.PullUp);
            pins.setPull(DigitalPin.P15, PinPullMode.PullUp);

            pins.setEvents(DigitalPin.P11, PinEventType.Edge);
            pins.setEvents(DigitalPin.P15, PinEventType.Edge);
            _initEvents_center = false;
        }
    }

    function initEvents_side(): void {
        if (_initEvents_side) {
            pins.setPull(DigitalPin.P6, PinPullMode.PullUp);
            pins.setPull(DigitalPin.P7, PinPullMode.PullUp);

            pins.setEvents(DigitalPin.P6, PinEventType.Edge);
            pins.setEvents(DigitalPin.P7, PinEventType.Edge);
            _initEvents_side = false;
        }
        
    }



}
