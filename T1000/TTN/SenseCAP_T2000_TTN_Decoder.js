function decodeUplink (input) {
    const bytes = input['bytes']
    const bytesString = bytes2HexString(bytes)
    const originMessage = bytesString.toLocaleUpperCase()
    const decoded = {
        valid: true,
        err: 0,
        payload: bytesString,
        messages: []
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
            decoded.messages.push(elements)
        }
    }
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
        let scanCount
        switch (dataId) {
            case '0C':
                dataValue = ''
                messageValue = remainMessage.substring(2)
                dataObj = {
                    'dataId': dataId, 'dataValue': ''
                }
                break
            case '0D':
                dataValue = remainMessage.substring(2, 10)
                messageValue = remainMessage.substring(10)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '27':
                packageLen = 92
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '28':
                packageLen = 60
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '29':
                packageLen = 24
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '2A':
                packageLen = 12
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '2B':
                packageLen = 46
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '2C':
                if (remainMessage.length < 32) {
                    return frameArray
                }
                scanCount = parseInt(remainMessage.substring(30, 32), 16)
                packageLen = (23 + (scanCount - 1) * 7) * 2
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '2D':
                if (remainMessage.length < 32) {
                    return frameArray
                }
                scanCount = parseInt(remainMessage.substring(30, 32), 16)
                packageLen = (23 + (scanCount - 1) * 7) * 2
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '2E':
                packageLen = 34
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '2F':
                if (remainMessage.length < 20) {
                    return frameArray
                }
                scanCount = parseInt(remainMessage.substring(18, 20), 16)
                packageLen = (17 + (scanCount - 1) * 7) * 2
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '30':
                if (remainMessage.length < 20) {
                    return frameArray
                }
                scanCount = parseInt(remainMessage.substring(18, 20), 16)
                packageLen = (17 + (scanCount - 1) * 7) * 2
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '31':
                packageLen = 30
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '32':
                packageLen = 18
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            default:
                return frameArray
        }
        if (dataValue.length < 2 && dataObj.dataId !== '0C') {
            break
        }
        frameArray.push(dataObj)
    }
    return frameArray
}

function deserialize (dataId, dataValue) {
    let measurementArray = []
    let eventList = []
    let timestamp = 0
    let value = null
    let motionId = 0
    let scanMax = 0
    let interval = 0
    let workMode = 0
    let heartbeatInterval = 0
    let periodicInterval = 0
    let eventInterval = 0
    let posId = null
    switch (dataId) {
        case '0C':
            measurementArray.push({type: "timeSync"})
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
        case '27':
            measurementArray.push(...getUpT2000(dataValue))
            break
        case '28':
            interval = 0
            workMode = getInt(dataValue.substring(0, 2))
            heartbeatInterval = getMinsByMin(dataValue.substring(4, 8))
            periodicInterval = getMinsByMin(dataValue.substring(8, 12))
            eventInterval = getMinsByMin(dataValue.substring(12, 16))
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
                {
                    measurementId: '3940', measurementValue: workMode
                }, {
                    measurementId: '3965', measurementValue: getPositioningStrategy(dataValue.substring(2, 4))
                }, {
                    measurementId: '3942', measurementValue: heartbeatInterval
                }, {
                    measurementId: '3943', measurementValue: periodicInterval
                }, {
                    measurementId: '3944', measurementValue: eventInterval
                }, {
                    measurementId: '3974', measurementValue: getInt(dataValue.substring(16, 18))
                }, {
                    measurementId: '3976', measurementValue: getInt(dataValue.substring(18, 20))
                }, {
                    measurementId: '3977', measurementValue: getInt(dataValue.substring(20, 22))
                }, {
                    measurementId: '3900', measurementValue: interval
                }, {
                    measurementId: '3978', measurementValue: getInt(dataValue.substring(22, 24))
                }, {
                    measurementId: '3979', measurementValue: dataValue.substring(26, 26 + getInt(dataValue.substring(24, 26)) * 2)
                }
            ]
            // measurementArray.push(measurement)
            break
        case '29':
            measurementArray.push({
                measurementId: '3946', value: getInt(dataValue.substring(0, 2))
            })
            measurementArray.push({
                measurementId: '3947', value: getSensorValue(dataValue.substring(2, 6), 1)
            })
            measurementArray.push({
                measurementId: '3948', value: getMinsByMin(dataValue.substring(6, 10))
            })
            measurementArray.push({
                measurementId: '3949', value: getInt(dataValue.substring(10, 12))
            })
            measurementArray.push({
                measurementId: '3950', value: getMinsByMin(dataValue.substring(12, 16))
            })
            measurementArray.push({
                measurementId: '3951', value: getInt(dataValue.substring(16, 18))
            })
            measurementArray.push({
                measurementId: '3952', value: getInt(dataValue.substring(18, 22))
            })
            break
        case '2A':
            measurementArray.push({
                measurementId: '3000', value: getBattery(dataValue.substring(0, 2))
            })
            measurementArray.push({
                measurementId: '3940', value: getWorkingMode(dataValue.substring(2, 4))
            })
            measurementArray.push({
                measurementId: '3965', value: getPositioningStrategy(dataValue.substring(4, 6))
            })
            measurementArray.push({
                measurementId: '3974', value: getInt(dataValue.substring(6, 8))
            })
            measurementArray.push({
                measurementId: '3976', value: getInt(dataValue.substring(8, 10))
            })
            break
        case '2B':
            eventList = getEventStatus(dataValue.substring(0, 4))
            motionId = getMotionId(dataValue.substring(4, 6))
            timestamp = getUTCTimestamp(dataValue.substring(6, 14))
            value = getSignSensorValue(dataValue.substring(14, 18), 1)
            if (value !== null) {
                measurementArray.push({
                    measurementId: '4210',
                    timestamp,
                    motionId,
                    value: value
                })
            }
            value = getSignSensorValue(dataValue.substring(18, 22), 1)
            if (value !== null) {
                measurementArray.push({
                    measurementId: '4211',
                    timestamp,
                    motionId,
                    value: value
                })
            }
            value = getSignSensorValue(dataValue.substring(22, 26), 1)
            if (value !== null) {
                measurementArray.push({
                    measurementId: '4212',
                    timestamp,
                    motionId,
                    value: value
                })
            }
            measurementArray.push({
                measurementId: '4197',
                timestamp,
                motionId,
                value: '' + getSensorValue(dataValue.substring(26, 34), 1000000)
            })
            measurementArray.push({
                measurementId: '4198',
                timestamp,
                motionId,
                value: '' + getSensorValue(dataValue.substring(34, 42), 1000000)
            })
            measurementArray.push({
                measurementId: '3000',
                timestamp,
                motionId,
                value: '' + getBattery(dataValue.substring(42, 44))
            })
            if (eventList && eventList.length > 0) {
                measurementArray.push({
                    measurementId: '4200',
                    timestamp,
                    motionId,
                    value: eventList
                })
            }
            break
        case '2C':
            // eventList = getEventStatus(dataValue.substring(0, 4))
            // motionId = getMotionId(dataValue.substring(4, 6))
            // timestamp = getUTCTimestamp(dataValue.substring(6, 14))
            // value = getSignSensorValue(dataValue.substring(14, 18), 1)
            // if (value !== null) {
            //     measurementArray.push({
            //         measurementId: '4210',
            //         timestamp,
            //         motionId,
            //         value: value
            //     })
            // }
            // value = getSignSensorValue(dataValue.substring(18, 22), 1)
            // if (value !== null) {
            //     measurementArray.push({
            //         measurementId: '4211',
            //         timestamp,
            //         motionId,
            //         value: value
            //     })
            // }
            // value = getSignSensorValue(dataValue.substring(22, 26), 1)
            // if (value !== null) {
            //     measurementArray.push({
            //         measurementId: '4212',
            //         timestamp,
            //         motionId,
            //         value: value
            //     })
            // }
            // measurementArray.push({
            //     measurementId: '3000',
            //     timestamp,
            //     motionId,
            //     value: '' + getBattery(dataValue.substring(26, 28))
            // })
            // scanMax = getInt(dataValue.substring(28, 30))
            // if (scanMax && scanMax > 0) {
            //     measurementArray.push({
            //         measurementId: '5001',
            //         timestamp,
            //         motionId,
            //         value: getMacAndRssiObj(dataValue.substring(30))
            //     })
            // }
            // if (eventList && eventList.length > 0) {
            //     measurementArray.push({
            //         measurementId: '4200',
            //         timestamp,
            //         motionId,
            //         value: eventList
            //     })
            // }
            // break
        case '2D':
            eventList = getEventStatus(dataValue.substring(0, 4))
            motionId = getMotionId(dataValue.substring(4, 6))
            timestamp = getUTCTimestamp(dataValue.substring(6, 14))
            value = getSignSensorValue(dataValue.substring(14, 18), 1)
            if (value !== null) {
                measurementArray.push({
                    measurementId: '4210',
                    timestamp,
                    motionId,
                    value: value
                })
            }
            value = getSignSensorValue(dataValue.substring(18, 22), 1)
            if (value !== null) {
                measurementArray.push({
                    measurementId: '4211',
                    timestamp,
                    motionId,
                    value: value
                })
            }
            value = getSignSensorValue(dataValue.substring(22, 26), 1)
            if (value !== null) {
                measurementArray.push({
                    measurementId: '4212',
                    timestamp,
                    motionId,
                    value: value
                })
            }
            measurementArray.push({
                measurementId: '3000',
                timestamp,
                motionId,
                value: '' + getBattery(dataValue.substring(26, 28))
            })
            scanMax = getInt(dataValue.substring(28, 30))
            if (scanMax && scanMax > 0) {
                measurementArray.push({
                    measurementId: dataId === '2D'? '5001':'5002',
                    timestamp,
                    motionId,
                    value: getMacAndRssiObj(dataValue.substring(30))
                })
            }
            if (eventList && eventList.length > 0) {
                measurementArray.push({
                    measurementId: '4200',
                    timestamp,
                    motionId,
                    value: eventList
                })
            }
            break
        case '2E':
            eventList = getEventStatus(dataValue.substring(0, 4))
            motionId = getMotionId(dataValue.substring(4, 6))
            timestamp = getUTCTimestamp(dataValue.substring(6, 14))
            measurementArray.push({
                measurementId: '4197',
                timestamp,
                motionId,
                value: '' + getSensorValue(dataValue.substring(14, 22), 1000000)
            })
            measurementArray.push({
                measurementId: '4198',
                timestamp,
                motionId,
                value: '' + getSensorValue(dataValue.substring(22, 30), 1000000)
            })
            measurementArray.push({
                measurementId: '3000',
                timestamp,
                motionId,
                value: '' + getBattery(dataValue.substring(30, 32))
            })
            if (eventList && eventList.length > 0) {
                measurementArray.push({
                    measurementId: '4200',
                    timestamp,
                    motionId,
                    value: eventList
                })
            }
            break
        case '2F':
            eventList = getEventStatus(dataValue.substring(0, 4))
            motionId = getMotionId(dataValue.substring(4, 6))
            timestamp = getUTCTimestamp(dataValue.substring(6, 14))
            measurementArray.push({
                measurementId: '3000',
                timestamp,
                motionId,
                value: '' + getBattery(dataValue.substring(14, 16))
            })
            scanMax = getInt(dataValue.substring(16, 18))
            if (scanMax && scanMax > 0) {
                measurementArray.push({
                    measurementId: '5001',
                    timestamp,
                    motionId,
                    value: getMacAndRssiObj(dataValue.substring(18))
                })
            }
            if (eventList && eventList.length > 0) {
                measurementArray.push({
                    measurementId: '4200',
                    timestamp,
                    motionId,
                    value: eventList
                })
            }
            break
        case '30':
            eventList = getEventStatus(dataValue.substring(0, 4))
            motionId = getMotionId(dataValue.substring(4, 6))
            timestamp = getUTCTimestamp(dataValue.substring(6, 14))
            measurementArray.push({
                measurementId: '3000',
                timestamp,
                motionId,
                value: '' + getBattery(dataValue.substring(14, 16))
            })
            scanMax = getInt(dataValue.substring(16, 18))
            if (scanMax && scanMax > 0) {
                measurementArray.push({
                    measurementId: '5002',
                    timestamp,
                    motionId,
                    value: getMacAndRssiObj(dataValue.substring(18))
                })
            }
            if (eventList && eventList.length > 0) {
                measurementArray.push({
                    measurementId: '4200',
                    timestamp,
                    motionId,
                    value: eventList
                })
            }
            break
        case '31':
            eventList = getEventStatus(dataValue.substring(2, 6))
            timestamp = getUTCTimestamp(dataValue.substring(6, 14))
            measurementArray.push({
                measurementId: '3576',
                timestamp,
                motionId,
                value: getPositingStatus(dataValue.substring(0, 2))
            })
            value = getSignSensorValue(dataValue.substring(14, 18), 1)
            if (value !== null) {
                measurementArray.push({
                    measurementId: '4210',
                    timestamp,
                    motionId,
                    value: value
                })
            }
            value = getSignSensorValue(dataValue.substring(18, 22), 1)
            if (value !== null) {
                measurementArray.push({
                    measurementId: '4211',
                    timestamp,
                    motionId,
                    value: value
                })
            }
            value = getSignSensorValue(dataValue.substring(22, 26), 1)
            if (value !== null) {
                measurementArray.push({
                    measurementId: '4212',
                    timestamp,
                    motionId,
                    value: value
                })
            }
            measurementArray.push({
                measurementId: '3000',
                timestamp,
                motionId,
                value: '' + getBattery(dataValue.substring(26, 28))
            })
            if (eventList && eventList.length > 0) {
                measurementArray.push({
                    measurementId: '4200',
                    timestamp,
                    motionId,
                    value: eventList
                })
            }
            break
        case '32':
            eventList = getEventStatus(dataValue.substring(2, 6))
            timestamp = getUTCTimestamp(dataValue.substring(6, 14))
            measurementArray.push({
                measurementId: '3576',
                timestamp,
                motionId,
                value: getPositingStatus(dataValue.substring(0, 2))
            })
            measurementArray.push({
                measurementId: '3000',
                timestamp,
                motionId,
                value: '' + getBattery(dataValue.substring(14, 16))
            })
            if (eventList && eventList.length > 0) {
                measurementArray.push({
                    measurementId: '4200',
                    timestamp,
                    motionId,
                    value: eventList
                })
            }
            break
    }
    if (measurementArray.length > 0) {
        for (let frag of measurementArray) {
            if (frag.measurementId) {
                frag.type = getTypeByMeasurementId(frag.measurementId)
            }
        }
    }
    return measurementArray
}

function getTypeByMeasurementId (measurementId) {
    switch (measurementId) {
        case '3000':
            return 'Battery'
        case '3502':
            return 'Firmware Version'
        case '3001':
            return 'Hardware Version'
        case '3940':
            return 'Work Mode'
        case '3965':
            return 'Positioning Strategy'
        case '3942':
            return 'Heartbeat Interval'
        case '3943':
            return 'Periodic Interval'
        case '3944':
            return 'Event Interval'
        case '3974':
            return '3X Sensor Enable'
        case '3976':
            return 'Anti-Theft'
        case '3977':
            return 'GNSS Scan Timeout'
        case '3900':
            return 'Uplink Interval'
        case '3978':
            return 'BLE Scan Timeout'
        case '3979':
            return 'UUID Filter'
        case '3946':
            return 'Motion Enable'
        case '3947':
            return 'Any Motion Threshold'
        case '3948':
            return 'Motion Start Interval'
        case '3949':
            return 'Static Enable'
        case '3950':
            return 'Device Static Timeout'
        case '3951':
            return 'Shock Enable'
        case '3952':
            return 'Shock Threshold'
        case '4210':
            return 'AccelerometerX'
        case '4211':
            return 'AccelerometerY'
        case '4212':
            return 'AccelerometerZ'
        case '4197':
            return 'Longitude'
        case '4198':
            return 'Latitude'
        case '4200':
            return 'Event Status'
        case '5001':
            return 'Wi-Fi Scan'
        case '5002':
            return 'BLE Scan'
        case '3576':
            return 'Positioning Status'
        default:
            return ''
    }
}

function getMotionId (str) {
    return getInt(str)
}

function getPositingStatus (str) {
    let status = getInt(str)
    switch (status) {
        case 0:
            return {id:status, statusName:"locate successful."}
        case 1:
            return {id:status, statusName:"The GNSS scan timed out."}
        case 2:
            return {id:status, statusName:"The Wi-Fi scan timed out."}
        case 3:
            return {id:status, statusName:"The Wi-Fi + GNSS scan timed out."}
        case 4:
            return {id:status, statusName:"The GNSS + Wi-Fi scan timed out."}
        case 5:
            return {id:status, statusName:"The Bluetooth scan timed out."}
        case 6:
            return {id:status, statusName:"The Bluetooth + Wi-Fi scan timed out."}
        case 7:
            return {id:status, statusName:"The Bluetooth + GNSS scan timed out."}
        case 8:
            return {id:status, statusName:"The Bluetooth + Wi-Fi + GNSS scan timed out."}
        case 9:
            return {id:status, statusName:"Location Server failed to parse the GNSS location."}
        case 10:
            return {id:status, statusName:"Location Server failed to parse the Wi-Fi location."}
        case 11:
            return {id:status, statusName:"Location Server failed to parse the Bluetooth location."}
        case 12:
            return {id:status, statusName:"Failed to parse location due to the poor accuracy."}
        case 13:
            return {id:status, statusName:"Time synchronization failed."}
        case 14:
            return {id:status, statusName:"Failed due to the old Almanac."}
        case 15:
            return {id:status, statusName:"The GNSS +Bluetooth scan timed out."}
    }
    return getInt(str)
}

function getUpT2000 (messageValue) {
    let interval = 0
    let workMode = getInt(messageValue.substring(10, 12))
    let heartbeatInterval = getMinsByMin(messageValue.substring(14, 18))
    let periodicInterval = getMinsByMin(messageValue.substring(18, 22))
    let eventInterval = getMinsByMin(messageValue.substring(22, 26))
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
    let data = [
        {
            measurementId: '3000', measurementValue: getBattery(messageValue.substring(0, 2))
        }, {
            measurementId: '3502', measurementValue: getSoftVersion(messageValue.substring(2, 6))
        }, {
            measurementId: '3001', measurementValue: getHardVersion(messageValue.substring(6, 10))
        }, {
            measurementId: '3940', measurementValue: workMode
        }, {
            measurementId: '3965', measurementValue: getPositioningStrategy(messageValue.substring(12, 14))
        }, {
            measurementId: '3942', measurementValue: heartbeatInterval
        }, {
            measurementId: '3943', measurementValue: periodicInterval
        }, {
            measurementId: '3944', measurementValue: eventInterval
        }, {
            measurementId: '3974', measurementValue: getInt(messageValue.substring(26, 28))
        }, {
            measurementId: '3976', measurementValue: getInt(messageValue.substring(28, 30))
        }, {
            measurementId: '3977', measurementValue: getInt(messageValue.substring(30, 32))
        }, {
            measurementId: '3900', measurementValue: interval
        }, {
            measurementId: '3978', measurementValue: getInt(messageValue.substring(54, 56))
        }, {
            measurementId: '3979', measurementValue: messageValue.substring(58, 58 + getInt(messageValue.substring(56, 58)) * 2)
        }
    ]
    let motionSetting = getMotionSetting(messageValue.substring(32, 42))
    let staticsSetting = getStaticSetting(messageValue.substring(42, 48))
    let shockSetting = getShockSetting(messageValue.substring(48, 54))
    data = [...data, ...motionSetting, ...staticsSetting, ...shockSetting]
    return data
}

function getMotionSetting (str) {
    return [
        {measurementId: '3946', measurementValue: getInt(str.substring(0, 2))},
        {measurementId: '3947', measurementValue: getSensorValue(str.substring(2, 6), 1)},
        {measurementId: '3948', measurementValue: getMinsByMin(str.substring(6, 10))},
    ]
}

function getStaticSetting (str) {
    return [
        {measurementId: '3949', measurementValue: getInt(str.substring(0, 2))},
        {measurementId: '3950', measurementValue: getMinsByMin(str.substring(2, 6))}
    ]
}

function getShockSetting (str) {
    return [
        {measurementId: '3951', measurementValue: getInt(str.substring(0, 2))},
        {measurementId: '3952', measurementValue: getInt(str.substring(2, 6))}
    ]
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

function isNull (str) {
    if (str.substring(0, 1) !== '8') {
        return false
    }
    for (let i = 1; i < str.length; i++) {
        if (str.substring(i, i + 1) !== '0') {
            return false
        }
    }
    return true
}

function getSignSensorValue (str, dig = 1) {
    if (isNull(str)) {
        return null
    }
    return loraWANV2DataFormat(str, dig)
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
            case 8:
                event.push({id: 9, eventName:"disassembled event"})
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
