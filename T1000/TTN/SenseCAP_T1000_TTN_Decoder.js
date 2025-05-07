// Added Longitude/ Latitude in decoded_payload in order to use ttnmapper.org
// 03.10.2023 / steffen@grau-zone.online

function decodeUplink (input) {
    const bytes = input['bytes']
    const fport = parseInt(input['fPort'])
    const bytesString = bytes2HexString(bytes)
    const originMessage = bytesString.toLocaleUpperCase()
    const decoded = {
        valid: true,
        err: 0,
        payload: bytesString,
        messages: []
    }
    if (fport === 199 || fport === 192) {
        decoded.messages.push({fport: fport, payload: bytesString})
        return { data: decoded }
    }
    let measurement = messageAnalyzed(originMessage)
    if (measurement.length === 0) {
        decoded.valid = false
        return { data: decoded }
    }

    for (let message of measurement) {
        if (message.length === 0) {
            continue
        }
        let elements = []
        for (let element of message) {
            if (element.errorCode) {
                decoded.err = element.errorCode
                decoded.errMessage = element.error
            } else {
                elements.push(element)
            }
        }
        if (elements.length > 0) {
                elements.push(element);
                if (element.measurementId === "4197") { decoded.longitude = element.measurementValue };
                if (element.measurementId === "4198") { decoded.latitude = element.measurementValue }
        }
    }
    // decoded.messages = measurement
    return { data: decoded }
}

function messageAnalyzed (messageValue) {
    try {
        let frames = unpack(messageValue)
        let measurementResultArray = []
        for (let i = 0; i < frames.length; i++) {
            let item = frames[i]
            let dataId = item.dataId
            let dataValue = item.dataValue
            let measurementArray = deserialize(dataId, dataValue)
            measurementResultArray.push(measurementArray)
        }
        return measurementResultArray
    } catch (e) {
        return e.toString()
    }
}

function unpack (messageValue) {
    let frameArray = []

    for (let i = 0; i < messageValue.length; i++) {
        let remainMessage = messageValue
        let dataId = remainMessage.substring(0, 2).toUpperCase()
        let dataValue
        let dataObj = {}
        let packageLen
        switch (dataId) {
            case '01':
                dataValue = remainMessage.substring(2, 94)
                messageValue = remainMessage.substring(94)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '02':
                dataValue = remainMessage.substring(2, 32)
                messageValue = remainMessage.substring(32)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '03':
                dataValue = remainMessage.substring(2, 64)
                messageValue = remainMessage.substring(64)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '04':
                dataValue = remainMessage.substring(2, 20)
                messageValue = remainMessage.substring(20)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '05':
                dataValue = remainMessage.substring(2, 10)
                messageValue = remainMessage.substring(10)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '06':
                dataValue = remainMessage.substring(2, 44)
                messageValue = remainMessage.substring(44)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '07':
                dataValue = remainMessage.substring(2, 84)
                messageValue = remainMessage.substring(84)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '08':
                dataValue = remainMessage.substring(2, 70)
                messageValue = remainMessage.substring(70)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '09':
                dataValue = remainMessage.substring(2, 36)
                messageValue = remainMessage.substring(36)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0A':
                dataValue = remainMessage.substring(2, 76)
                messageValue = remainMessage.substring(76)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0B':
                dataValue = remainMessage.substring(2, 62)
                messageValue = remainMessage.substring(62)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0C':
                break
            case '0D':
                dataValue = remainMessage.substring(2, 10)
                messageValue = remainMessage.substring(10)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0E':
                packageLen = getInt(remainMessage.substring(8, 10)) * 2 + 10
                dataValue = remainMessage.substring(2, 8) + remainMessage.substring(10, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0F':
                dataValue = remainMessage.substring(2, 34)
                messageValue = remainMessage.substring(34)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '10':
                dataValue = remainMessage.substring(2, 26)
                messageValue = remainMessage.substring(26)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '11':
                dataValue = remainMessage.substring(2, 28)
                messageValue = remainMessage.substring(28)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '1A':
                dataValue = remainMessage.substring(2, 56)
                messageValue = remainMessage.substring(56)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '1B':
                dataValue = remainMessage.substring(2, 96)
                messageValue = remainMessage.substring(96)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '1C':
                dataValue = remainMessage.substring(2, 82)
                messageValue = remainMessage.substring(82)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '1D':
                dataValue = remainMessage.substring(2, 40)
                messageValue = remainMessage.substring(40)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            default:
                return frameArray
        }
        if (dataValue.length < 2) {
            break
        }
        frameArray.push(dataObj)
    }
    return frameArray
}

function deserialize (dataId, dataValue) {
    let measurementArray = []
    let eventList = []
    let measurement = {}
    let collectTime = 0
    let groupId = 0
    let shardFlag = {}
    let payload = ''
    let motionId = ''
    switch (dataId) {
        case '01':
            measurementArray = getUpShortInfo(dataValue)
            measurementArray.push(...getMotionSetting(dataValue.substring(30, 40)))
            measurementArray.push(...getStaticSetting(dataValue.substring(40, 46)))
            measurementArray.push(...getShockSetting(dataValue.substring(46, 52)))
            measurementArray.push(...getTempSetting(dataValue.substring(52, 72)))
            measurementArray.push(...getLightSetting(dataValue.substring(72, 92)))
            break
        case '02':
            measurementArray = getUpShortInfo(dataValue)
            break
        case '03':
            measurementArray.push(...getMotionSetting(dataValue.substring(0, 10)))
            measurementArray.push(...getStaticSetting(dataValue.substring(10, 16)))
            measurementArray.push(...getShockSetting(dataValue.substring(16, 22)))
            measurementArray.push(...getTempSetting(dataValue.substring(22, 42)))
            measurementArray.push(...getLightSetting(dataValue.substring(42, 62)))
            break
        case '04':
            let interval = 0
            let workMode = getInt(dataValue.substring(0, 2))
            let heartbeatInterval = getMinsByMin(dataValue.substring(4, 8))
            let periodicInterval = getMinsByMin(dataValue.substring(8, 12))
            let eventInterval = getMinsByMin(dataValue.substring(12, 16))
            switch (workMode) {
                case 0:
                    interval = heartbeatInterval
                    break
                case 1:
                    interval = periodicInterval
                    break
                case 2:
                    interval = eventInterval
                    break
            }
            measurementArray = [
                {measurementId: '3940', type: 'Work Mode', measurementValue: workMode},
                {measurementId: '3942', type: 'Heartbeat Interval', measurementValue: heartbeatInterval},
                {measurementId: '3943', type: 'Periodic Interval', measurementValue: periodicInterval},
                {measurementId: '3944', type: 'Event Interval', measurementValue: eventInterval},
                {measurementId: '3941', type: 'SOS Mode', measurementValue: getSOSMode(dataValue.substring(16, 18))},
                {measurementId: '3900', type: 'Uplink Interval', measurementValue: interval}
            ]
            break;
        case '05':
            measurementArray = [
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(0, 2))},
                {measurementId: '3940', type: 'Work Mode', measurementValue: getWorkingMode(dataValue.substring(2, 4))},
                {measurementId: '3965', type: 'Positioning Strategy', measurementValue: getPositioningStrategy(dataValue.substring(4, 6))},
                {measurementId: '3941', type: 'SOS Mode', measurementValue: getSOSMode(dataValue.substring(6, 8))}
            ]
            break
        case '06':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray = [
                {measurementId: '4200', timestamp: collectTime, motionId: motionId, type: 'Event Status', measurementValue: getEventStatus(dataValue.substring(0, 6))},
                {measurementId: '4197', timestamp: collectTime, motionId: motionId, type: 'Longitude', measurementValue: parseFloat(getSensorValue(dataValue.substring(16, 24), 1000000))},
                {measurementId: '4198', timestamp: collectTime, motionId: motionId, type: 'Latitude', measurementValue: parseFloat(getSensorValue(dataValue.substring(24, 32), 1000000))},
                {measurementId: '4097', timestamp: collectTime, motionId: motionId, type: 'Air Temperature', measurementValue: getSensorValue(dataValue.substring(32, 36), 10)},
                {measurementId: '4199', timestamp: collectTime, motionId: motionId, type: 'Light', measurementValue: getSensorValue(dataValue.substring(36, 40))},
                {measurementId: '3000', timestamp: collectTime, motionId: motionId, type: 'Battery', measurementValue: getBattery(dataValue.substring(40, 42))}
            ]
            break
        case '07':
            eventList = getEventStatus(dataValue.substring(0, 6))
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray = [
                {measurementId: '4200', timestamp: collectTime, motionId: motionId, type: 'Event Status', measurementValue: getEventStatus(dataValue.substring(0, 6))},
                {measurementId: '5001', timestamp: collectTime, motionId: motionId, type: 'Wi-Fi Scan', measurementValue: getMacAndRssiObj(dataValue.substring(16, 72))},
                {measurementId: '4097', timestamp: collectTime, motionId: motionId, type: 'Air Temperature', measurementValue: getSensorValue(dataValue.substring(72, 76), 10)},
                {measurementId: '4199', timestamp: collectTime, motionId: motionId, type: 'Light', measurementValue: getSensorValue(dataValue.substring(76, 80))},
                {measurementId: '3000', timestamp: collectTime, motionId: motionId, type: 'Battery', measurementValue: getBattery(dataValue.substring(80, 82))}
            ]
            break
        case '08':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray = [
                {measurementId: '4200', timestamp: collectTime, motionId: motionId, type: 'Event Status', measurementValue: getEventStatus(dataValue.substring(0, 6))},
                {measurementId: '5002', timestamp: collectTime, motionId: motionId, type: 'BLE Scan', measurementValue: getMacAndRssiObj(dataValue.substring(16, 58))},
                {measurementId: '4097', timestamp: collectTime, motionId: motionId, type: 'Air Temperature', measurementValue: getSensorValue(dataValue.substring(58, 62), 10)},
                {measurementId: '4199', timestamp: collectTime, motionId: motionId, type: 'Light', measurementValue: getSensorValue(dataValue.substring(62, 66))},
                {measurementId: '3000', timestamp: collectTime, motionId: motionId, type: 'Battery', measurementValue: getBattery(dataValue.substring(66, 68))}
            ]
            break
        case '09':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray = [
                {measurementId: '4200', timestamp: collectTime, motionId: motionId, type: 'Event Status', measurementValue: getEventStatus(dataValue.substring(0, 6))},
                {measurementId: '4197', timestamp: collectTime, motionId: motionId, type: 'Longitude', measurementValue: parseFloat(getSensorValue(dataValue.substring(16, 24), 1000000))},
                {measurementId: '4198', timestamp: collectTime, motionId: motionId, type: 'Latitude', measurementValue: parseFloat(getSensorValue(dataValue.substring(24, 32), 1000000))},
                {measurementId: '3000', timestamp: collectTime, motionId: motionId, type: 'Battery', measurementValue: getBattery(dataValue.substring(32, 34))}
            ]
            break
        case '0A':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray = [
                {measurementId: '4200', timestamp: collectTime, motionId, type: 'Event Status', measurementValue: getEventStatus(dataValue.substring(0, 6))},
                {measurementId: '5001', timestamp: collectTime, motionId, type: 'Wi-Fi Scan', measurementValue: getMacAndRssiObj(dataValue.substring(16, 72))},
                {measurementId: '3000', timestamp: collectTime, motionId, type: 'Battery', measurementValue: getBattery(dataValue.substring(72, 74))}
            ]
            break
        case '0B':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray = [
                {measurementId: '4200', timestamp: collectTime, motionId, type: 'Event Status', measurementValue: getEventStatus(dataValue.substring(0, 6))},
                {measurementId: '5002', timestamp: collectTime, motionId, type: 'BLE Scan', measurementValue: getMacAndRssiObj(dataValue.substring(16, 58))},
                {measurementId: '3000', timestamp: collectTime, motionId, type: 'Battery', measurementValue: getBattery(dataValue.substring(58, 60))},
            ]
            break
        case '0D':
            let errorCode = getInt(dataValue)
            let error = ''
            switch (errorCode) {
                case 1:
                    error = 'FAILED TO OBTAIN THE UTC TIMESTAMP'
                    break
                case 2:
                    error = 'ALMANAC TOO OLD'
                    break
                case 3:
                    error = 'DOPPLER ERROR'
                    break
            }
            measurementArray.push({errorCode, error})
            break
        case '0E':
            shardFlag = getShardFlag(dataValue.substring(0, 2))
            groupId = getInt(dataValue.substring(2, 6))
            payload = dataValue.substring(6)
            measurement = {
                measurementId: '6152',
                groupId: groupId,
                index: shardFlag.index,
                count: shardFlag.count,
                type: 'gnss-ng payload',
                measurementValue: payload
            }
            measurementArray.push(measurement)
            break
        case '0F':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            shardFlag = getShardFlag(dataValue.substring(26, 28))
            groupId = getInt(dataValue.substring(28, 32))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray.push({
                measurementId: '4200',
                timestamp: collectTime,
                motionId,
                groupId: groupId,
                index: shardFlag.index,
                count: shardFlag.count,
                type: 'Event Status',
                measurementValue: getEventStatus(dataValue.substring(0, 6))
            })
            measurementArray.push({
                measurementId: '4097',
                timestamp: collectTime,
                motionId,
                groupId: groupId,
                index: shardFlag.index,
                count: shardFlag.count,
                type: 'Air Temperature',
                measurementValue: getSensorValue(dataValue.substring(16, 20), 10)
            })
            measurementArray.push({
                measurementId: '4199',
                timestamp: collectTime,
                motionId,
                groupId: groupId,
                index: shardFlag.index,
                count: shardFlag.count,
                type: 'Light',
                measurementValue: getSensorValue(dataValue.substring(20, 24))
            })
            measurementArray.push({
                measurementId: '3000',
                timestamp: collectTime,
                motionId,
                groupId: groupId,
                index: shardFlag.index,
                count: shardFlag.count,
                type: 'Battery',
                measurementValue: getBattery(dataValue.substring(24, 26))
            })
            break
        case '10':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            shardFlag = getShardFlag(dataValue.substring(18, 20))
            groupId = getInt(dataValue.substring(20, 24))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray.push({
                measurementId: '4200',
                timestamp: collectTime,
                motionId,
                groupId: groupId,
                index: shardFlag.index,
                count: shardFlag.count,
                type: 'Event Status',
                measurementValue: getEventStatus(dataValue.substring(0, 6))
            })
            measurementArray.push({
                measurementId: '3000',
                timestamp: collectTime,
                motionId,
                groupId: groupId,
                index: shardFlag.index,
                count: shardFlag.count,
                type: 'Battery',
                measurementValue: getBattery(dataValue.substring(16, 18))
            })
            break
        case '11':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            measurementArray.push({
                measurementId: '3576',
                timestamp: collectTime,
                type: 'Positioning Status',
                measurementValue: getPositingStatus(dataValue.substring(0, 2))
            })
            measurementArray.push({
                timestamp: collectTime,
                measurementId: '4200',
                type: 'Event Status',
                measurementValue: getEventStatus(dataValue.substring(2, 8))
            })
            if (!isNaN(parseFloat(getSensorValue(dataValue.substring(16, 20), 10)))) {
                measurementArray.push({
                    timestamp: collectTime,
                    measurementId: '4097',
                    type: 'Air Temperature',
                    measurementValue: getSensorValue(dataValue.substring(16, 20), 10)
                })
            }
            if (!isNaN(parseFloat(getSensorValue(dataValue.substring(20, 24))))) {
                measurementArray.push({
                    timestamp: collectTime,
                    measurementId: '4199',
                    type: 'Light',
                    measurementValue: getSensorValue(dataValue.substring(20, 24))
                })
            }
            measurementArray.push({
                timestamp: collectTime,
                measurementId: '3000',
                type: 'Battery',
                measurementValue: getBattery(dataValue.substring(24, 26))
            })
            break
        case '1A':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray = [
                {measurementId: '4200', timestamp: collectTime, motionId, type: 'Event Status', measurementValue: getEventStatus(dataValue.substring(0, 6))},
                {measurementId: '4197', timestamp: collectTime, motionId, type: 'Longitude', measurementValue: parseFloat(getSensorValue(dataValue.substring(16, 24), 1000000))},
                {measurementId: '4198', timestamp: collectTime, motionId, type: 'Latitude', measurementValue: parseFloat(getSensorValue(dataValue.substring(24, 32), 1000000))},
                {measurementId: '4097', timestamp: collectTime, motionId, type: 'Air Temperature', measurementValue: getSensorValue(dataValue.substring(32, 36), 10)},
                {measurementId: '4199', timestamp: collectTime, motionId, type: 'Light', measurementValue: getSensorValue(dataValue.substring(36, 40))},
                {measurementId: '4210', timestamp: collectTime, motionId, type: 'AccelerometerX', measurementValue: getSensorValue(dataValue.substring(40, 44))},
                {measurementId: '4211', timestamp: collectTime, motionId, type: 'AccelerometerY', measurementValue: getSensorValue(dataValue.substring(44, 48))},
                {measurementId: '4212', timestamp: collectTime, motionId, type: 'AccelerometerZ', measurementValue: getSensorValue(dataValue.substring(48, 52))},
                {measurementId: '3000', timestamp: collectTime, motionId, type: 'Battery', measurementValue: getBattery(dataValue.substring(52, 54))},
            ]
            break
        // WIFI定位数据+sensor+三轴+电量
        case '1B':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray = [
                {measurementId: '4200', timestamp: collectTime, motionId, type: 'Event Status', measurementValue: getEventStatus(dataValue.substring(0, 6))},
                {measurementId: '5001', timestamp: collectTime, motionId, type: 'Wi-Fi Scan', measurementValue: getMacAndRssiObj(dataValue.substring(16, 72))},
                {measurementId: '4097', timestamp: collectTime, motionId, type: 'Air Temperature', measurementValue: getSensorValue(dataValue.substring(72, 76), 10)},
                {measurementId: '4199', timestamp: collectTime, motionId, type: 'Light', measurementValue: getSensorValue(dataValue.substring(76, 80))},
                {measurementId: '4210', timestamp: collectTime, motionId, type: 'AccelerometerX', measurementValue: getSensorValue(dataValue.substring(80, 84))},
                {measurementId: '4211', timestamp: collectTime, motionId, type: 'AccelerometerY', measurementValue: getSensorValue(dataValue.substring(84, 88))},
                {measurementId: '4212', timestamp: collectTime, motionId, type: 'AccelerometerZ', measurementValue: getSensorValue(dataValue.substring(88, 92))},
                {measurementId: '3000', timestamp: collectTime, motionId, type: 'Battery', measurementValue: getBattery(dataValue.substring(92, 94))}
            ]
            break
        // BLE定位数据+sensor+三轴+电量
        case '1C':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            motionId = getMotionId(dataValue.substring(6, 8))
            measurementArray = [
                {measurementId: '4200', timestamp: collectTime, motionId, type: 'Event Status', measurementValue: getEventStatus(dataValue.substring(0, 6))},
                {measurementId: '5002', timestamp: collectTime, motionId, type: 'BLE Scan', measurementValue: getMacAndRssiObj(dataValue.substring(16, 58))},
                {measurementId: '4097', timestamp: collectTime, motionId, type: 'Air Temperature', measurementValue: getSensorValue(dataValue.substring(58, 62), 10)},
                {measurementId: '4199', timestamp: collectTime, motionId, type: 'Light', measurementValue: getSensorValue(dataValue.substring(62, 66))},
                {measurementId: '4210', timestamp: collectTime, motionId, type: 'AccelerometerX', measurementValue: getSensorValue(dataValue.substring(66, 70))},
                {measurementId: '4211', timestamp: collectTime, motionId, type: 'AccelerometerY', measurementValue: getSensorValue(dataValue.substring(70, 74))},
                {measurementId: '4212', timestamp: collectTime, motionId, type: 'AccelerometerZ', measurementValue: getSensorValue(dataValue.substring(74, 78))},
                {measurementId: '3000', timestamp: collectTime, motionId, type: 'Battery', measurementValue: getBattery(dataValue.substring(78, 80))}
            ]
            break
        // 定位状态 + sensor+三轴数据上报
        case '1D':
            collectTime = getUTCTimestamp(dataValue.substring(8, 16))
            measurementArray.push({
                measurementId: '3576',
                timestamp: collectTime,
                type: 'Positioning Status',
                measurementValue: getPositingStatus(dataValue.substring(0, 2))
            })
            measurementArray.push({
                timestamp: collectTime,
                measurementId: '4200',
                type: 'Event Status',
                measurementValue: getEventStatus(dataValue.substring(2, 8))
            })
            if (!isNaN(parseFloat(getSensorValue(dataValue.substring(16, 20), 10)))) {
                measurementArray.push({
                    timestamp: collectTime,
                    measurementId: '4097',
                    type: 'Air Temperature',
                    measurementValue: getSensorValue(dataValue.substring(16, 20), 10)
                })
            }
            if (!isNaN(parseFloat(getSensorValue(dataValue.substring(20, 24))))) {
                measurementArray.push({
                    timestamp: collectTime,
                    measurementId: '4199',
                    type: 'Light',
                    measurementValue: getSensorValue(dataValue.substring(20, 24))
                })
            }
            measurementArray.push({
                timestamp: collectTime,
                measurementId: '4210',
                type: 'AccelerometerX',
                measurementValue: getSensorValue(dataValue.substring(24, 28))
            })
            measurementArray.push({
                timestamp: collectTime,
                measurementId: '4211',
                type: 'AccelerometerY',
                measurementValue: getSensorValue(dataValue.substring(28, 32))
            })
            measurementArray.push({
                timestamp: collectTime,
                measurementId: '4212',
                type: 'AccelerometerZ',
                measurementValue: getSensorValue(dataValue.substring(32, 36))
            })
            measurementArray.push({
                timestamp: collectTime,
                measurementId: '3000',
                type: 'Battery',
                measurementValue: getBattery(dataValue.substring(36, 38))
            })
            break
    }
    return measurementArray
}

function getMotionId (str) {
    return getInt(str)
}

function getPositingStatus (str) {
    let status = getInt(str)
    switch (status) {
        case 0:
            return {id:status, statusName:"Positioning successful."}
        case 1:
            return {id:status, statusName:"The GNSS scan timed out and failed to obtain the location."}
        case 2:
            return {id:status, statusName:"The Wi-Fi scan timed out and failed to obtain the location."}
        case 3:
            return {id:status, statusName:"The Wi-Fi + GNSS scan timed out and failed to obtain the location."}
        case 4:
            return {id:status, statusName:"The GNSS + Wi-Fi scan timed out and failed to obtain the location."}
        case 5:
            return {id:status, statusName:"The Bluetooth scan timed out and failed to obtain the location."}
        case 6:
            return {id:status, statusName:"The Bluetooth + Wi-Fi scan timed out and failed to obtain the location."}
        case 7:
            return {id:status, statusName:"The Bluetooth + GNSS scan timed out and failed to obtain the location."}
        case 8:
            return {id:status, statusName:"The Bluetooth + Wi-Fi + GNSS scan timed out and failed to obtain the location."}
        case 9:
            return {id:status, statusName:"Location Server failed to parse the GNSS location."}
        case 10:
            return {id:status, statusName:"Location Server failed to parse the Wi-Fi location."}
        case 11:
            return {id:status, statusName:"Location Server failed to parse the Bluetooth location."}
        case 12:
            return {id:status, statusName:"Failed to parse the GNSS location due to the poor accuracy."}
        case 13:
            return {id:status, statusName:"Time synchronization failed."}
        case 14:
            return {id:status, statusName:"Failed to obtain location due to the old Almanac."}
    }
    return getInt(str)
}

function getUpShortInfo (messageValue) {
    return [
        {
            measurementId: '3000', type: 'Battery', measurementValue: getBattery(messageValue.substring(0, 2))
        }, {
            measurementId: '3502', type: 'Firmware Version', measurementValue: getSoftVersion(messageValue.substring(2, 6))
        }, {
            measurementId: '3001', type: 'Hardware Version', measurementValue: getHardVersion(messageValue.substring(6, 10))
        }, {
            measurementId: '3940', type: 'Work Mode', measurementValue: getWorkingMode(messageValue.substring(10, 12))
        }, {
            measurementId: '3965', type: 'Positioning Strategy', measurementValue: getPositioningStrategy(messageValue.substring(12, 14))
        }, {
            measurementId: '3942', type: 'Heartbeat Interval', measurementValue: getMinsByMin(messageValue.substring(14, 18))
        }, {
            measurementId: '3943', type: 'Periodic Interval', measurementValue: getMinsByMin(messageValue.substring(18, 22))
        }, {
            measurementId: '3944', type: 'Event Interval', measurementValue: getMinsByMin(messageValue.substring(22, 26))
        }, {
            measurementId: '3945', type: 'Sensor Enable', measurementValue: getInt(messageValue.substring(26, 28))
        }, {
            measurementId: '3941', type: 'SOS Mode', measurementValue: getSOSMode(messageValue.substring(28, 30))
        }
    ]
}

function getMotionSetting (str) {
    return [
        {measurementId: '3946', type: 'Motion Enable', measurementValue: getInt(str.substring(0, 2))},
        {measurementId: '3947', type: 'Any Motion Threshold', measurementValue: getSensorValue(str.substring(2, 6), 1)},
        {measurementId: '3948', type: 'Motion Start Interval', measurementValue: getMinsByMin(str.substring(6, 10))},
    ]
}

function getStaticSetting (str) {
    return [
        {measurementId: '3949', type: 'Static Enable', measurementValue: getInt(str.substring(0, 2))},
        {measurementId: '3950', type: 'Device Static Timeout', measurementValue: getMinsByMin(str.substring(2, 6))}
    ]
}

function getShockSetting (str) {
    return [
        {measurementId: '3951', type: 'Shock Enable', measurementValue: getInt(str.substring(0, 2))},
        {measurementId: '3952', type: 'Shock Threshold', measurementValue: getInt(str.substring(2, 6))}
    ]
}

function getTempSetting (str) {
    return [
        {measurementId: '3953', type: 'Temp Enable', measurementValue: getInt(str.substring(0, 2))},
        {measurementId: '3954', type: 'Event Temp Interval', measurementValue: getMinsByMin(str.substring(2, 6))},
        {measurementId: '3955', type: 'Event Temp Sample Interval', measurementValue: getSecondsByInt(str.substring(6, 10))},
        {measurementId: '3956', type: 'Temp ThMax', measurementValue: getSensorValue(str.substring(10, 14), 10)},
        {measurementId: '3957', type: 'Temp ThMin', measurementValue: getSensorValue(str.substring(14, 18), 10)},
        {measurementId: '3958', type: 'Temp Warning Type', measurementValue: getInt(str.substring(18, 20))}
    ]
}

function getLightSetting (str) {
    return [
        {measurementId: '3959', type: 'Light Enable', measurementValue: getInt(str.substring(0, 2))},
        {measurementId: '3960', type: 'Event Light Interval', measurementValue: getMinsByMin(str.substring(2, 6))},
        {measurementId: '3961', type: 'Event Light Sample Interval', measurementValue: getSecondsByInt(str.substring(6, 10))},
        {measurementId: '3962', type: 'Light ThMax', measurementValue: getSensorValue(str.substring(10, 14), 10)},
        {measurementId: '3963', type: 'Light ThMin', measurementValue: getSensorValue(str.substring(14, 18), 10)},
        {measurementId: '3964', type: 'Light Warning Type', measurementValue: getInt(str.substring(18, 20))}
    ]
}

function getShardFlag (str) {
    let bitStr = getByteArray(str)
    return {
        count: parseInt(bitStr.substring(0, 4), 2),
        index: parseInt(bitStr.substring(4), 2)
    }
}

function getBattery (batteryStr) {
    return loraWANV2DataFormat(batteryStr)
}
function getSoftVersion (softVersion) {
    return `${loraWANV2DataFormat(softVersion.substring(0, 2))}.${loraWANV2DataFormat(softVersion.substring(2, 4))}`
}
function getHardVersion (hardVersion) {
    return `${loraWANV2DataFormat(hardVersion.substring(0, 2))}.${loraWANV2DataFormat(hardVersion.substring(2, 4))}`
}

function getSecondsByInt (str) {
    return getInt(str)
}

function getMinsByMin (str) {
    return getInt(str)
}

function getSensorValue (str, dig) {
    if (str === '8000') {
        return null
    } else {
        return loraWANV2DataFormat(str, dig)
    }
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

function bigEndianTransform (data) {
    let dataArray = []
    for (let i = 0; i < data.length; i += 2) {
        dataArray.push(data.substring(i, i + 2))
    }
    return dataArray
}

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
    return binaryData.toString().replace(/,/g, '')
}

function getSOSMode (str) {
    return loraWANV2DataFormat(str)
}

function getMacAndRssiObj (pair) {
    let pairs = []
    if (pair.length % 14 === 0) {
        for (let i = 0; i < pair.length; i += 14) {
            let mac = getMacAddress(pair.substring(i, i + 12))
            if (mac) {
                let rssi = getInt8RSSI(pair.substring(i + 12, i + 14))
                pairs.push({mac: mac, rssi: rssi})
            } else {
                continue
            }
        }
    }
    return pairs
}

function getMacAddress (str) {
    if (str.toLowerCase() === 'ffffffffffff') {
        return null
    }
    let macArr = []
    for (let i = 1; i < str.length; i++) {
        if (i % 2 === 1) {
            macArr.push(str.substring(i - 1, i + 1))
        }
    }
    let mac = ''
    for (let i = 0; i < macArr.length; i++) {
        mac = mac + macArr[i]
        if (i < macArr.length - 1) {
            mac = mac + ':'
        }
    }
    return mac
}

function getInt8RSSI (str) {
    return loraWANV2DataFormat(str)
}

function getInt (str) {
    return parseInt(str, 16)
}

function getEventStatus (str) {
    // return getInt(str)
    let bitStr = getByteArray(str)
    let bitArr = []
    for (let i = 0; i < bitStr.length; i++) {
        bitArr[i] = bitStr.substring(i, i + 1)
    }
    bitArr = bitArr.reverse()
    let event = []
    for (let i = 0; i < bitArr.length; i++) {
        if (bitArr[i] !== '1') {
            continue
        }
        switch (i){
            case 0:
                event.push({id:1, eventName:"Start moving event."})
                break
            case 1:
                event.push({id:2, eventName:"End movement event."})
                break
            case 2:
                event.push({id:3, eventName:"Motionless event."})
                break
            case 3:
                event.push({id:4, eventName:"Shock event."})
                break
            case 4:
                event.push({id:5, eventName:"Temperature event."})
                break
            case 5:
                event.push({id:6, eventName:"Light event."})
                break
            case 6:
                event.push({id:7, eventName:"SOS event."})
                break
            case 7:
                event.push({id:8, eventName:"Press once event."})
                break
        }
    }
    return event
}

function getByteArray (str) {
    let bytes = []
    for (let i = 0; i < str.length; i += 2) {
        bytes.push(str.substring(i, i + 2))
    }
    return toBinary(bytes)
}

function getWorkingMode (workingMode) {
    return getInt(workingMode)
}

function getPositioningStrategy (strategy) {
    return getInt(strategy)
}

function getUTCTimestamp(str){
    return parseInt(loraWANV2PositiveDataFormat(str)) * 1000
}

function loraWANV2PositiveDataFormat (str, divisor = 1) {
    let strReverse = bigEndianTransform(str)
    let str2 = toBinary(strReverse)
    return parseInt(str2, 2) / divisor
}
