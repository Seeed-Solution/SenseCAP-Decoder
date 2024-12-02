const {IoTDataPlaneClient, PublishCommand} = require("@aws-sdk/client-iot-data-plane");
const client = new IoTDataPlaneClient({
//Replace the region according to your device.
    "region": "us-east-1"
});
const topic_prefix = 'sensor/s2107/'

function decodeUplink (input, port) {
    const bytes = Buffer.from(input, 'base64');
    // // init
    var bytesString = bytes2HexString(bytes)
        .toLocaleUpperCase();
    let result = {
        'err': 0, 'payload': bytesString, 'valid': true, messages: []
    }
    let splitArray = dataSplit(bytesString)
    // data decoder
    let decoderArray = []
    for (let i = 0; i < splitArray.length; i++) {
        let item = splitArray[i]
        let dataId = item.dataId
        let dataValue = item.dataValue
        let messages = dataIdAndDataValueJudge(dataId, dataValue)
        decoderArray.push(messages)
    }
    result.messages = decoderArray
    return { data: result }
}

/**
 * data splits
 * @param bytes
 * @returns {*[]}
 */
function dataSplit (bytes) {
    let frameArray = []
    bytes = bytes.toLowerCase()
    for (let i = 0; i < bytes.length; i++) {
        let remainingValue = bytes
        let dataId = remainingValue.substring(0, 2)
        let dataValue
        let dataObj = {}
        switch (dataId) {
            case '01' :
            case '20' :
            case '21' :
            case '30' :
            case '31' :
            case '33' :
            case '40' :
            case '41' :
            case '42' :
            case '43' :
            case '44' :
            case '45' :
            case '46' :
            case '48' :
                dataValue = remainingValue.substring(2, 22)
                bytes = remainingValue.substring(22)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '02':
                dataValue = remainingValue.substring(2, 18)
                bytes = remainingValue.substring(18)
                dataObj = {
                    'dataId': '02', 'dataValue': dataValue
                }
                break
            case '03' :
            case '06':
                dataValue = remainingValue.substring(2, 4)
                bytes = remainingValue.substring(4)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '05' :
            case '34' :
                dataValue = bytes.substring(2, 10)
                bytes = remainingValue.substring(10)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '04' :
            case '10' :
            case '32' :
            case '35' :
            case '36' :
            case '37' :
            case '38' :
            case '39' :
                dataValue = bytes.substring(2, 20)
                bytes = remainingValue.substring(20)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '47' :
                dataValue = bytes.substring(2, 14)
                bytes = remainingValue.substring(14)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '49' :
                dataValue = bytes.substring(2, 16)
                bytes = remainingValue.substring(16)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '7f' :
                bytes = remainingValue.substring(4)
                continue
            default:
                dataValue = '9'
                break
        }
        if (dataValue.length < 2) {
            break
        }
        frameArray.push(dataObj)
    }
    return frameArray
}

function dataIdAndDataValueJudge (dataId, dataValue) {
    let messages = []
    switch (dataId) {
        case '01':
            let temperature = dataValue.substring(0, 4)
            let humidity = dataValue.substring(4, 6)
            let illumination = dataValue.substring(6, 14)
            let uv = dataValue.substring(14, 16)
            let windSpeed = dataValue.substring(16, 20)
            messages = [{
                measurementValue: loraWANV2DataFormat(temperature, 10), measurementId: '4097', type: 'Air Temperature'
            }, {
                measurementValue: loraWANV2DataFormat(humidity), measurementId: '4098', type: 'Air Humidity'
            }, {
                measurementValue: loraWANV2DataFormat(illumination), measurementId: '4099', type: 'Light Intensity'
            }, {
                measurementValue: loraWANV2DataFormat(uv, 10), measurementId: '4190', type: 'UV Index'
            }, {
                measurementValue: loraWANV2DataFormat(windSpeed, 10), measurementId: '4105', type: 'Wind Speed'
            }]
            break
        case '02':
            let windDirection = dataValue.substring(0, 4)
            let rainfall = dataValue.substring(4, 12)
            let airPressure = dataValue.substring(12, 16)
            messages = [{
                measurementValue: loraWANV2DataFormat(windDirection), measurementId: '4104', type: 'Wind Direction Sensor'
            }, {
                measurementValue: loraWANV2DataFormat(rainfall, 1000), measurementId: '4113', type: 'Rain Gauge'
            }, {

                measurementValue: loraWANV2DataFormat(airPressure, 0.1), measurementId: '4101', type: 'Barometric Pressure'
            }]
            break
        case '03':
            let Electricity = dataValue
            messages = [{
                'Battery(%)': loraWANV2DataFormat(Electricity)
            }]
            break
        case '04':
            let electricityWhether = dataValue.substring(0, 2)
            let hwv = dataValue.substring(2, 6)
            let bdv = dataValue.substring(6, 10)
            let sensorAcquisitionInterval = dataValue.substring(10, 14)
            let gpsAcquisitionInterval = dataValue.substring(14, 18)
            messages = [{
                'Battery(%)': loraWANV2DataFormat(electricityWhether),
                'Hardware Version': `${loraWANV2DataFormat(hwv.substring(0, 2))}.${loraWANV2DataFormat(hwv.substring(2, 4))}`,
                'Firmware Version': `${loraWANV2DataFormat(bdv.substring(0, 2))}.${loraWANV2DataFormat(bdv.substring(2, 4))}`,
                'measureInterval': parseInt(loraWANV2DataFormat(sensorAcquisitionInterval)) * 60,
                'gpsInterval': parseInt(loraWANV2DataFormat(gpsAcquisitionInterval)) * 60
            }]
            break
        case '05':
            let sensorAcquisitionIntervalFive = dataValue.substring(0, 4)
            let gpsAcquisitionIntervalFive = dataValue.substring(4, 8)
            messages = [{
                'measureInterval': parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalFive)) * 60,
                'gpsInterval': parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalFive)) * 60
            }]
            break
        case '06':
            let errorCode = dataValue
            let descZh
            switch (errorCode) {
                case '00':
                    descZh = 'CCL_SENSOR_ERROR_NONE'
                    break
                case '01':
                    descZh = 'CCL_SENSOR_NOT_FOUND'
                    break
                case '02':
                    descZh = 'CCL_SENSOR_WAKEUP_ERROR'
                    break
                case '03':
                    descZh = 'CCL_SENSOR_NOT_RESPONSE'
                    break
                case '04':
                    descZh = 'CCL_SENSOR_DATA_EMPTY'
                    break
                case '05':
                    descZh = 'CCL_SENSOR_DATA_HEAD_ERROR'
                    break
                case '06':
                    descZh = 'CCL_SENSOR_DATA_CRC_ERROR'
                    break
                case '07':
                    descZh = 'CCL_SENSOR_DATA_B1_NO_VALID'
                    break
                case '08':
                    descZh = 'CCL_SENSOR_DATA_B2_NO_VALID'
                    break
                case '09':
                    descZh = 'CCL_SENSOR_RANDOM_NOT_MATCH'
                    break
                case '0A':
                    descZh = 'CCL_SENSOR_PUBKEY_SIGN_VERIFY_FAILED'
                    break
                case '0B':
                    descZh = 'CCL_SENSOR_DATA_SIGN_VERIFY_FAILED'
                    break
                case '0C':
                    descZh = 'CCL_SENSOR_DATA_VALUE_HI'
                    break
                case '0D':
                    descZh = 'CCL_SENSOR_DATA_VALUE_LOW'
                    break
                case '0E':
                    descZh = 'CCL_SENSOR_DATA_VALUE_MISSED'
                    break
                case '0F':
                    descZh = 'CCL_SENSOR_ARG_INVAILD'
                    break
                case '10':
                    descZh = 'CCL_SENSOR_RS485_MASTER_BUSY'
                    break
                case '11':
                    descZh = 'CCL_SENSOR_RS485_REV_DATA_ERROR'
                    break
                case '12':
                    descZh = 'CCL_SENSOR_RS485_REG_MISSED'
                    break
                case '13':
                    descZh = 'CCL_SENSOR_RS485_FUN_EXE_ERROR'
                    break
                case '14':
                    descZh = 'CCL_SENSOR_RS485_WRITE_STRATEGY_ERROR'
                    break
                case '15':
                    descZh = 'CCL_SENSOR_CONFIG_ERROR'
                    break
                case 'FF':
                    descZh = 'CCL_SENSOR_DATA_ERROR_UNKONW'
                    break
                default:
                    descZh = 'CC_OTHER_FAILED'
                    break
            }
            messages = [{
                measurementId: '4101', type: 'sensor_error_event', errCode: errorCode, descZh
            }]
            break
        case '10':
            let statusValue = dataValue.substring(0, 2)
            let { status, type } = loraWANV2BitDataFormat(statusValue)
            let sensecapId = dataValue.substring(2)
            messages = [{
                status: status, channelType: type, sensorEui: sensecapId
            }]
            break
        case '46':
            let measurementTime = loraWANV2PositiveDataFormat(dataValue.substring(0, 8)) * 1000
            let offLineTmpOne = loraWanSensorFormat(dataValue.substring(8, 12), 100)
            let offLineTmpTwo = loraWanSensorFormat(dataValue.substring(12, 16), 100)
            let offLineTmpThree = loraWanSensorFormat(dataValue.substring(16, 20), 100)
            messages = []
            if (offLineTmpOne) {
                messages.push({
                    measurementValue: '' + offLineTmpOne,
                    measurementId: '4203',
                    type:"Temperature",
                    measurementChannel: '1',
                    measureTime: measurementTime
                })
            }
            if (offLineTmpTwo) {
                messages.push({
                    measurementValue: '' + offLineTmpTwo,
                    measurementId: '4203',
                    type:"Temperature",
                    measurementChannel: '2',
                    measureTime: measurementTime
                })
            }
            if (offLineTmpThree) {
                messages.push({
                    measurementValue: '' + offLineTmpThree,
                    measurementId: '4203',
                    type:"Temperature",
                    measurementChannel: '3',
                    measureTime: measurementTime
                })
            }
            break
        case '47':
            let tmpOne = loraWanSensorFormat(dataValue.substring(0, 4), 100)
            let tmpTwo = loraWanSensorFormat(dataValue.substring(4, 8), 100)
            let tmpThree = loraWanSensorFormat(dataValue.substring(8, 16), 100)
            if (tmpOne) {
                messages.push({
                    measurementValue: '' + tmpOne,
                    measurementId: '4203',
                    type:"Temperature",
                    measurementChannel: '1'
                })
            }
            if (tmpTwo) {
                messages.push({
                    measurementValue: '' + tmpTwo,
                    measurementId: '4203',
                    type:"Temperature",
                    measurementChannel: '2'
                })
            }
            if (tmpThree) {
                messages.push({
                    measurementValue: '' + tmpThree,
                    measurementId: '4203',
                    type:"Temperature",
                    measurementChannel: '3'
                })
            }
            break
        case '48':
            for (let i = 0; i < dataValue.length; i += 2) {
                let channelStatusHex = dataValue.substring(i, i + 2)
                if (channelStatusHex.toLowerCase() === 'ff') {
                    continue
                }
                let channelStatus = loraWANV2DataFormat(channelStatusHex)
                let statusStr = 'normal'
                if (parseInt(channelStatus) === 0) {
                    statusStr = 'idle'
                } else if (parseInt(channelStatus) === 2) {
                    statusStr = 'abnormal'
                }
                messages.push({
                    channel_index: '' + (1 + i / 2), status: statusStr, channelType: '1'
                })
            }
            break
        case '49':
            messages = [{
                'Battery(%)': loraWANV2DataFormat(dataValue.substring(0, 2)),
                'Hardware Version': `${loraWANV2DataFormat(dataValue.substring(2, 4))}.${loraWANV2DataFormat(dataValue.substring(4, 6))}`,
                'Firmware Version': `${loraWANV2DataFormat(dataValue.substring(6, 8))}.${loraWANV2DataFormat(dataValue.substring(8, 10))}`,
                'measureInterval': parseInt(loraWANV2DataFormat(dataValue.substring(10, 14))) * 60
            }]
            break
        default:
            break
    }
    return messages
}

/**
 *
 * data formatting
 * @param str
 * @param divisor
 * @returns {string|number}
 */
function loraWANV2DataFormat (str, divisor = 1) {
    let strReverse = bigEndianTransform(str)
    let str2 = toBinary(strReverse)
    if (str2.substring(0, 1) === '1') {
        let arr = str2.split('')
        let reverseArr = arr.map((item) => {
            if (parseInt(item) === 1) {
                return 0
            } else {
                return 1
            }
        })
        str2 = parseInt(reverseArr.join(''), 2) + 1
        return parseFloat('-' + str2 / divisor)
    }
    return parseInt(str2, 2) / divisor
}

function loraWanSensorFormat (str, divisor = 1) {
    if (str === '8000') {
        return null
    }
    return loraWANV2DataFormat(str, divisor)
}

/**
 * Handling big-endian data formats
 * @param data
 * @returns {*[]}
 */
function bigEndianTransform (data) {
    let dataArray = []
    for (let i = 0; i < data.length; i += 2) {
        dataArray.push(data.substring(i, i + 2))
    }
    // array of hex
    return dataArray
}

function loraWANV2PositiveDataFormat (str, divisor = 1) {
    let strReverse = bigEndianTransform(str)
    let str2 = toBinary(strReverse)
    return parseInt(str2, 2) / divisor
}

/**
 * Convert to an 8-digit binary number with 0s in front of the number
 * @param arr
 * @returns {string}
 */
function toBinary (arr) {
    let binaryData = arr.map((item) => {
        let data = parseInt(item, 16)
            .toString(2)
        let dataLength = data.length
        if (data.length !== 8) {
            for (let i = 0; i < 8 - dataLength; i++) {
                data = `0` + data
            }
        }
        return data
    })
    let ret = binaryData.toString()
        .replace(/,/g, '')
    return ret
}

/**
 * sensor
 * @param str
 * @returns {{channel: number, type: number, status: number}}
 */
function loraWANV2BitDataFormat (str) {
    let strReverse = bigEndianTransform(str)
    let str2 = toBinary(strReverse)
    let channel = parseInt(str2.substring(0, 4), 2)
    let status = parseInt(str2.substring(4, 5), 2)
    let type = parseInt(str2.substring(5), 2)
    return { channel, status, type }
}

function bytes2HexString (arrBytes) {
    var str = ''
    for (var i = 0; i < arrBytes.length; i++) {
        var tmp
        var num = arrBytes[i]
        if (num < 0) {
            tmp = (255 + num + 1).toString(16)
        } else {
            tmp = num.toString(16)
        }
        if (tmp.length === 1) {
            tmp = '0' + tmp
        }
        str += tmp
    }
    return str
}



exports.handler = async (event) => {
    try {
        const lorawan_info = event["WirelessMetadata"]["LoRaWAN"];
        const device_id = event["WirelessDeviceId"]
        const device_eui = lorawan_info["DevEui"]
        const lorawan_data = event["PayloadData"];
        const resolved_data = decodeUplink(lorawan_data, lorawan_info["FPort"]);

        const input = {
            topic: `${topic_prefix}${device_eui}`,
            qos: 0,
            retain: false,
            payload: JSON.stringify({
                eui: device_eui,
                device_id: device_id,
                timestamp: lorawan_info["Timestamp"],
                data: resolved_data.data
            })
        };
        const command = new PublishCommand(input);
        const response = await client.send(command);
        console.log("response: " + JSON.stringify(response));
        return {
            statusCode: 200,
            body: 'Message published successfully' + JSON.stringify(event)
        };
    } catch (error) {
        console.error('Error publishing message:', error);

        return {
            statusCode: 500,
            body: 'Error publishing message'
        };
    }
};

