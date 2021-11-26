/**
 * Functions to luckycar by DeeJoin Co.,Ltd.
 */
//% weight=500 color=#FF0000  icon="\uf1b9" 
namespace luckycar {
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
