
/**
 * Functions to luckycar by DeeJoin Co.,Ltd.
 */
//% weight=500 color=#FF0000  icon="\uf1b9" 
namespace luckycar {
    ///////////////////////
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
                            const job = _jobs[i];
                            if (job.id == jobId) {
                                _jobs.removeAt(i);
                                break;
                            }
                        }
                    });
                    this._jobsToRemove = []


                    // Execute all jobs
                    if (this._type === Thread.Priority) {
                        // newest first
                        for (let i = _jobs.length - 1; i >= 0; i--) {
                            if (_jobs[i].run(delta)) {
                                this._jobsToRemove.push(_jobs[i].id)
                            }
                        }
                    } else {
                        // Execute in order of schedule
                        for (let i = 0; i < _jobs.length; i++) {
                            if (_jobs[i].run(delta)) {
                                this._jobsToRemove.push(_jobs[i].id)
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

    let _initEvents = true
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
    /**
     * Pins used to generate events
     */
    export enum CenterTrackPins {
        //% block="Left" 
        Left = DAL.MICROBIT_ID_IO_P11,
        //% block="Right" 
        Right = DAL.MICROBIT_ID_IO_P15
    }
    /**
    * Line Sensor events    MICROBIT_PIN_EVT_RISE
    */
    export enum CenterTrackEvents {
        //% block="Found" 
        FindLine = DAL.MICROBIT_PIN_EVT_FALL,
        //% block="Lost" 
        LoseLine = DAL.MICROBIT_PIN_EVT_RISE
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
        pins.setPull(DigitalPin.P11, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P15, PinPullMode.PullNone)
        let center_left_tracking = pins.digitalReadPin(DigitalPin.P11);
        let center_right_tracking = pins.digitalReadPin(DigitalPin.P15);
        if (center_left_tracking == 0 && center_right_tracking == 0 && state == 0) {
            return true;
        }
        else if (center_left_tracking == 1 && center_right_tracking == 0 && state == 1) {
            return true;
        }
        else if (center_left_tracking == 0 && center_right_tracking == 1 && state == 2) {
            return true;
        }
        else if (center_left_tracking == 1 && center_left_tracking == 1 && state == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
    * TODO: track one side
    * @param side Line sensor edge , eg: CenterTrackPins.Left
    * @param state Line sensor status, eg: CenterTrackEvents.FindLine
    */
    //% block="%side line sensor %state"
    //% state.fieldEditor="gridpicker" state.fieldOptions.columns=2
    //% side.fieldEditor="gridpicker" side.fieldOptions.columns=2
    //% weight=60
    export function trackSide(side: CenterTrackPins, state: CenterTrackEvents): boolean {
        pins.setPull(DigitalPin.P11, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P15, PinPullMode.PullNone)
        let left_tracking = pins.digitalReadPin(DigitalPin.P11);
        let right_tracking = pins.digitalReadPin(DigitalPin.P15);
        if (side == 0 && state == 1 && left_tracking == 1) {
            return true;
        }
        else if (side == 0 && state == 0 && left_tracking == 0) {
            return true;
        }
        else if (side == 1 && state == 1 && right_tracking == 1) {
            return true;
        }
        else if (side == 1 && state == 0 && right_tracking == 0) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
    * Cars can extend the ultrasonic function to prevent collisions and other functions.. 
    * @param Sonarunit two states of ultrasonic module, eg: Centimeters
    */
    //% blockId=ultrasonic block="HC-SR04 Sonar unit %unit"
    //% weight=55
    export function ultrasonic(unit: SonarUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P14, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P14, 1);
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P14, 0);
        // read pulse
        const d = pins.pulseIn(DigitalPin.P13, PulseValue.High, maxCmDistance * 50);
        switch (unit) {
            case SonarUnit.Centimeters:
                return Math.floor(d * 9 / 6 / 58);
            case SonarUnit.Inches:
                return Math.floor(d * 9 / 6 / 148);
            default:
                return d;
        }
    }

    /**
    * TODO: Runs when line sensor finds or loses.
    */
    //% block="On %sensor| line %event"
    //% sensor.fieldEditor="gridpicker" sensor.fieldOptions.columns=2
    //% event.fieldEditor="gridpicker" event.fieldOptions.columns=2
    //% weight=50
    export function trackEvent(sensor: CenterTrackPins, event: CenterTrackEvents, handler: Action) {
        initEvents();
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
        pins.setAudioPin(AnalogPin.P9)
    }


    function initEvents(): void {
        if (_initEvents) {
            pins.setEvents(DigitalPin.P11, PinEventType.Edge);
            pins.setEvents(DigitalPin.P11, PinEventType.Edge);
            _initEvents = false;
        }
    }



}
