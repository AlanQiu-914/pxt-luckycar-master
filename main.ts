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
//% weight=50 color=#e7660b icon="\uf1b9"
namespace AlphaCar {
    /**
     * 小车马达、循迹控制
     */

    let _initEvents_center = true
    let _initEvents_side = true

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

    /**
    * Stop modes. Coast or Brake
    */
    export enum CarStopMode {
        //% block="no brake"
        Coast,
        //% block="brake"
        Brake
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
    // subcategory="Motors"
    //% block="Set left wheel speed %lspeed\\% |right wheel speed %rspeed\\%"
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
            if (lspeed != 0)
                lspeed = 0.84 * lspeed+15.16;
            pins.analogWritePin(AnalogPin.P0, lspeed == 100 ? 1023 : (lspeed * 1023) / 100);
            pins.digitalWritePin(DigitalPin.P12, 0);
        }
        else {
            lspeed = Math.abs(lspeed);
            lspeed = 0.75 * lspeed + 24.25;
            pins.analogWritePin(AnalogPin.P0, ((100 - lspeed) * 1023) / 100);
            pins.digitalWritePin(DigitalPin.P12, 1);
        }
        if (rspeed >= 0) {
            if (rspeed != 0)
                rspeed = 0.84 * rspeed + 15.16;
            pins.analogWritePin(AnalogPin.P1, rspeed == 100 ? 1023 : (rspeed * 1023) / 100);
            pins.digitalWritePin(DigitalPin.P8, 0);
        }
        else {
            rspeed = Math.abs(rspeed);
            rspeed = 0.75 * rspeed + 24.25;
            pins.analogWritePin(AnalogPin.P1, ((100 - rspeed) * 1023) / 100);
            pins.digitalWritePin(DigitalPin.P8, 1);
        }
    }
    /**
    * TODO: Full speed operation lasts for 10 seconds,speed is 100.
    * @param dir Driving direction, eg: Direction.forward
    * @param speed Running speed, eg: 50
    * @param time Travel time, eg: 5
    */
    // subcategory="Motors"
    //% block="Go %dir at speed%speed\\% for %time seconds"
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
    // subcategory="Motors"
    //% block="Go straight at full speed"
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
    // subcategory="Motors"
    //% block="Reverse at full speed"
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
    // subcategory="Motors"
    //% block="Turn left at full speed"
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
    // subcategory="Motors"
    //% block="Turn right at full speed"
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
    // subcategory="Motors"
    //% block="Stop car with %mode"
    //% weight=70
    export function stopcar(mode: CarStopMode): void {
        if (mode == 0)
            motors(0, 0);
        else {
            pins.analogWritePin(AnalogPin.P0, 1023);
            pins.digitalWritePin(DigitalPin.P12, 1);

            pins.analogWritePin(AnalogPin.P1, 1023);
            pins.digitalWritePin(DigitalPin.P8, 1);
        }
    }

    /**
    * Judging the Current Status of Center Tracking Module. 
    * @param state Four states of Center tracking module, eg: TrackingState.C_L_R_line
    */
    //% subcategory="LineSensor"
    //% block="Center tracking state is %state"
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
    //% subcategory="LineSensor"
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
    * Judging the Current Status of Side Tracking Module. 
    * @param state Four states of Side tracking module, eg: TrackingState.C_L_R_line
    */
    //% subcategory="LineSensor"
    //% block="Side tracking state is %state"
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
    
    /**
    * TODO: Runs when center line sensor finds or loses.
    */
    //% subcategory="LineSensor"
    //% block="On Center %sensor| line %event"
    //%sensor.fieldEditor="gridpicker" sensor.fieldOptions.columns=2
    //%event.fieldEditor="gridpicker" event.fieldOptions.columns=2
    //% weight=50
    export function trackEventCenter(sensor: CenterTrackPins, event: TrackEvents, handler: Action) {
        initEvents_center();
        control.onEvent(<number>sensor, <number>event, handler);
    }

    /**
    * TODO: Runs when side line sensor finds or loses.
    */
    //% subcategory="LineSensor"
    //% block="On Side %sensor| line %event"
    //%sensor.fieldEditor="gridpicker" sensor.fieldOptions.columns=2
    //%event.fieldEditor="gridpicker" event.fieldOptions.columns=2
    //% weight=45
    export function trackEventSide(sensor: SideTrackPins, event: TrackEvents, handler: Action) {
        initEvents_side();
        control.onEvent(<number>sensor, <number>event, handler);
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
            // subcategory="RGB_CTR"
            // blockId="neopixel_set_strip_color" block="%strip|show color %rgb=neopixel_colors"
            // strip.defl=strip
            // weight=85 blockGap=8
            // parts="neopixel"
            showColor(rgb: number) {
                rgb = rgb >> 0;
                this.setAllRGB(rgb);
                this.show();
            }

            /**
             * Set LED to a given color (range 0-255 for r, g, b).
             * You need to call ``show`` to make the changes visible.
             * @param pixeloffset position of the NeoPixel in the strip
             * @param rgb RGB color of the LED
             */
            setPixelColor(pixeloffset: number, rgb: number): void {
                this.setPixelRGB(pixeloffset >> 0, rgb >> 0);
            }

            /**
             * Send all the changes to the strip.
             */
            show() {
                // only supported in beta
                // ws2812b.setBufferMode(this.pin, this._mode);
                ws2812b.sendBuffer(this.buf, this.pin);
            }

            /**
             * Turn off all LEDs.
             * You need to call ``show`` to make the changes visible.
             */
            clear(): void {
                const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
                this.buf.fill(0, this.start * stride, this._length * stride);
            }

            /**
             * Gets the number of pixels declared on the strip
             */
            length() {
                return this._length;
            }

            /**
             * Set the brightness of the strip. This flag only applies to future operation.
             * @param brightness a measure of LED brightness in 0-255. eg: 255
             */
            setBrightness(brightness: number): void {
                this.brightness = brightness & 0xff;
            }

            /**
             * Apply brightness to current colors using a quadratic easing function.
             **/
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
             * Shift LEDs forward and clear with zeros.
             * You need to call ``show`` to make the changes visible.
             * @param offset number of pixels to shift forward, eg: 1
             */
            shift(offset: number = 1): void {
                offset = offset >> 0;
                const stride = this._mode === NeoPixelMode.RGBW ? 4 : 3;
                this.buf.shift(-offset * stride, this.start * stride, this._length * stride)
            }

            /**
             * Rotate LEDs forward.
             * You need to call ``show`` to make the changes visible
             * @param offset number of pixels to rotate forward, eg: 1
             */
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
            //% parts="neopixel" 
            setPin(pin: DigitalPin): void {
                this.pin = pin;
                pins.digitalWritePin(this.pin, 0);
                // don't yield to avoid races on initialization
            }

            /**
             * Estimates the electrical current (mA) consumed by the current light configuration.
             */
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
         * rgb init. 
         * DigitalPin.P0, 4 leds,NeoPixelMode.RGB
         */
        let carstrip = new Strip();
        /**
         * Rgb init.
         */
        //% subcategory="RGB_CTR"
        //% block="Car Rgb Init"
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
        /**
         * Set each RGB color.
         */
        //% subcategory="RGB_CTR"
        //% block="set car pixel color at %pixeloffset|to $rgb"
        //% rgb.shadow="colorNumberPicker"
        //% blockGap=8
        //% weight=80
        //% parts="neopixel" 
        export function setCarPixelColor(pixeloffset: RgbNum, rgb: number): void {
            carstrip.setPixelColor(pixeloffset >> 0, rgb >> 0);
            carstrip.show();
        }

        /**
        * Set the brightness of the car rgb. This flag only applies to future operation.
        * @param brightness a measure of LED brightness in 0-255. eg: 255
        */
        //% subcategory="RGB_CTR"
        //% block="set car rgb brightness %brightness" 
        //% brightness.min=0 brightness.max=255
        //% blockGap=8
        //% weight=80
        //% parts="neopixel" 
        export function setCarBrightness(brightness: number): void {
            carstrip.brightness = brightness & 0xff;
        }

        /**
         * Set all RGB one color.
         */
        //% subcategory="RGB_CTR"
        //% block="car rgb show color $rgb"
        //% rgb.shadow="colorNumberPicker"
        //% blockGap=8
        //% weight=80
        //% parts="neopixel" 
        export function setCarRgbAll(rgb: number): void {
            carstrip.showColor(rgb >> 0);
        }

        /**
        * Rotate LEDs forward.
        * @param offset number of pixels to rotate forward, eg: 1
        */
        //% subcategory="RGB_CTR"
        //% block="car rgb rotate" blockGap=8
        //% weight=80
        //% parts="neopixel"
        export function CarRgbRotate(): void {
            const stride = carstrip._mode === NeoPixelMode.RGBW ? 4 : 3;
            carstrip.buf.rotate(-1 * stride, carstrip.start * stride, carstrip._length * stride);
            carstrip.show();;
        }

        /**
         * Converts red, green, blue channels into a RGB color.
         * @param red value of the red channel between 0 and 255. eg: 255
         * @param green value of the green channel between 0 and 255. eg: 255
         * @param blue value of the blue channel between 0 and 255. eg: 255
         */
        //% subcategory="RGB_CTR"
        //% weight=1
        //% block="red %red|green %green|blue %blue"
        export function rgb(red: number, green: number, blue: number): number {
            return packRGB(red, green, blue);
        }

        /**
         * Gets the RGB value of a known color
        */
        // subcategory="RGB_CTR"
        // weight=2 blockGap=8
        // blockId="neopixel_colors" block="%color"
        export function colors(color: number): number {
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
        // subcategory="RGB_CTR"
        // blockId=neopixelHSL block="hue %h|saturation %s|luminosity %l"
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
    * 小车底部颜色识别
    */
    //读光敏电阻数据，取平均值操作
    function ReadColorValue(count: number): number {
        let value = 0;
        for (let i = 0; i < count; i++) {
            value += pins.analogReadPin(AnalogPin.P2);
            basic.pause(5);
        }
        value = Math.round(value / count);
        return value;
    }


    //返回色彩值
    function ColorNum(): number {
        let num = 0;        //1:red,2:green,3:blue,4:black,5:white
        let redvalue = 0, greenvalue = 0, bluevalue = 0;
        let minvalue = 1024, maxvalue = 0;
        neopixel.setCarBrightness(255);

        //发红光
        neopixel.setCarPixelColor(AlphaCar.RgbNum.front_dowm, AlphaCar.neopixel.colors(NeoPixelColors.Red));
        redvalue = ReadColorValue(5);
        neopixel.setCarPixelColor(AlphaCar.RgbNum.front_dowm, AlphaCar.neopixel.colors(NeoPixelColors.Black));

        //发绿光
        neopixel.setCarPixelColor(AlphaCar.RgbNum.front_dowm, AlphaCar.neopixel.colors(NeoPixelColors.Green));
        greenvalue = ReadColorValue(5);
        neopixel.setCarPixelColor(AlphaCar.RgbNum.front_dowm, AlphaCar.neopixel.colors(NeoPixelColors.Black));

        //发蓝光
        neopixel.setCarPixelColor(AlphaCar.RgbNum.front_dowm, AlphaCar.neopixel.colors(NeoPixelColors.Blue));
        bluevalue = ReadColorValue(5);
        neopixel.setCarPixelColor(AlphaCar.RgbNum.front_dowm, AlphaCar.neopixel.colors(NeoPixelColors.Black));

        maxvalue = Math.max(Math.max(redvalue, greenvalue), bluevalue);
        minvalue = Math.min(Math.min(redvalue, greenvalue), bluevalue);

        if (minvalue > 800)
            num = 4;
        else if (maxvalue < 700)
            num = 5;
        else if (redvalue == minvalue)
            num = 1;
        else if (greenvalue == minvalue)
            num = 2;
        else if (bluevalue == minvalue)
            num = 3;

        return num;
    }

    export enum ColorChoiceValue {
        //% block="Red"
        Red = 1,
        //% block="Green"
        Green = 2,
        //% block="Blue"
        Blue = 3,
        //% block="Black"
        Black = 4,
        //% block="White"
        White = 5
    }
    /**
    * TODO: find the color
    */
    //% subcategory="Others"
    //% block="%colorchoice color is find"
    //% weight=1
    export function findcolornum(colorchoice: ColorChoiceValue): boolean {
        let count = 0;
        for (let i = 0; i < 5; i++) {
            if (ColorNum() == colorchoice)
                count++;
        }
        if (count > 2)
            return true;
        else
            return false;
    }
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
    //% subcategory="Others"
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
    //% subcategory="Others"
    //% block="on IR button | %button | %action"
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.columns=3
    //% button.fieldOptions.tooltips="false"
    //% weight=85
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
    
    //
    let distanceBackup: number = 0;
    /**
    * Cars can extend the ultrasonic function to prevent collisions and other functions.. 
    */
    //% subcategory="Others"
    //% block="HC-SR04 Sonar"
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

        RangeInCentimeters = duration * 153 / 44 / 2 / 100;

        if (RangeInCentimeters > 0) distanceBackup = RangeInCentimeters;
        else RangeInCentimeters = distanceBackup;

        basic.pause(50);

        return RangeInCentimeters;
    }

    /**
    * Cars read brightness on Left and right
    */
    //% subcategory="Others"
    //% block="%num Brightness value"
    //% weight=55
    export function brightness(num: BrightnessChoice): number {
        let mesuBrightness = 0;
        if (num == 0) {
            for (let i = 0; i < 6; i++) {
                mesuBrightness = mesuBrightness + pins.analogReadPin(AnalogPin.P10);
                basic.pause(10);
            }
            mesuBrightness = Math.round(mesuBrightness / 10);
        }
        else if (num == 1) {
            for (let i = 0; i < 6; i++) {
                mesuBrightness = mesuBrightness + pins.analogReadPin(AnalogPin.P3);
                basic.pause(10);
            }
            mesuBrightness = Math.round(mesuBrightness / 10);
        }
        return (1024 - mesuBrightness);
    }


}
