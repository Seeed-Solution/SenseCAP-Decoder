
function decodeUplink (input, port) {
    var bytes = input['bytes']
    bytes = bytes2HexString(bytes)
      .toLocaleUpperCase()
  
    let result = {
      'err': 0, 'payload': bytes, 'valid': true, messages: []
    }
    let splitArray = dataSplit(bytes)
    // data decoder
    let decoderArray = []
    let modelName = 'unknown model'
    let classes = null
    for (let fragment of splitArray) {
      if (fragment.dataId !== '33') {
        continue
      }
      fragment.modelId = parseInt(loraWANV2DataFormat(fragment.dataValue.substring(12, 20), 1000)) - 1000000
      let modelInfo = getModelInfo(fragment.modelId + '')
      if (modelInfo) {
        modelName = modelInfo.modelName
        classes = modelInfo.classes
      }
    }
    for (let i = 0; i < splitArray.length; i++) {
      let item = splitArray[i]
      let dataId = item.dataId
      let dataValue = item.dataValue
      let messages = dataIdAndDataValueJudge(dataId, dataValue, modelName, classes)
      if (!messages || messages.length === 0) {
        continue
      }
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
        case '34':
          dataValue = bytes.substring(2, 10)
          bytes = remainingValue.substring(10)
          dataObj = {
            'dataId': dataId, 'dataValue': dataValue
          }
          break
        case '04':
        case '10':
        case '32':
        case '35':
        case '36':
        case '37':
        case '38':
        case '39':
          dataValue = bytes.substring(2, 20)
          bytes = remainingValue.substring(20)
          dataObj = {
            'dataId': dataId, 'dataValue': dataValue
          }
          break
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
  
  function dataIdAndDataValueJudge (dataId, dataValue, modelName, classes) {
    let messages = []
    let dataOne
    let dataTwo
    switch (dataId) {
      case '01':
        break
      case '02':
        break
      case '03':
        break
      case '04':
        break
      case '05':
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
      case '30':
      case '31':
        let channelInfoOne = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
        dataOne = loraWANV2DataFormat(dataValue.substring(4, 12))
        dataTwo = loraWANV2DataFormat(dataValue.substring(12, 20))
        if (parseInt(dataOne) !== -1000) {
          if (modelName === 'Digital Meter Electricity') {
            let classId = parseInt(dataOne / 1000)
            let targetName = (classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown')
            messages.push({
              measurementValue: dataOne / 1000,
              measurementId: '4165',
              type: `${targetName} value`
            })
          } else {
            let classId = parseInt(dataOne / 1000)
            let targetName = (classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown')
            messages.push({
              measurementValue: (dataOne / 1000) + 0.01,
              measurementId: '4165',
              type: `${targetName} Conf`
            })
          }
        }
        if (parseInt(dataTwo) !== -1000) {
          if (modelName === 'Digital Meter Electricity') {
            let classId = parseInt(dataTwo / 1000)
            let targetName = (classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown')
            messages.push({
              measurementValue: dataTwo / 1000,
              measurementId: '4166',
              type: `${targetName} value`
            })
          } else {
            let classId = parseInt(dataTwo / 1000)
            let targetName = (classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown')
            messages.push({
              measurementValue: (dataTwo / 1000) + 0.01,
              measurementId: '4166',
              type: `${targetName} Conf`
            })
          }
        }
        break
      case '32':
        let channelInfoTwo = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
        dataOne = loraWANV2DataFormat(dataValue.substring(2, 10))
        dataTwo = loraWANV2DataFormat(dataValue.substring(10, 18))
        if (parseInt(dataOne) !== -1000) {
          if (modelName === 'Digital Meter Electricity') {
            let classId = parseInt(dataOne / 1000)
            let targetName = (classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown')
            messages.push({
              measurementValue: dataOne / 1000,
              measurementId: 4164 + parseInt(channelInfoTwo.one) + '',
              type: `${targetName} value`
            })
          } else {
            let classId = parseInt(dataOne / 1000)
            let targetName = (classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown')
            messages.push({
              measurementValue: (dataOne / 1000) + 0.01,
              measurementId: 4164 + parseInt(channelInfoTwo.one) + '',
              type: `${targetName} Conf`
            })
          }
        }
        if (parseInt(dataTwo) !== -1000) {
          if (modelName === 'Digital Meter Electricity') {
            let classId = parseInt(dataTwo / 1000)
            let targetName = (classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown')
            messages.push({
              measurementValue: dataTwo / 1000,
              measurementId: 4164 + parseInt(channelInfoTwo.two) + '',
              type: `${targetName} value`
            })
          } else {
            let classId = parseInt(dataTwo / 1000)
            let targetName = (classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown')
            messages.push({
              measurementValue: (dataTwo / 1000) + 0.01,
              measurementId: 4164 + parseInt(channelInfoTwo.two) + '',
              type: `${targetName} Conf`
            })
          }
        }
        break
      case '33':
        let channelInfoThree = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
        dataOne = loraWANV2DataFormat(dataValue.substring(4, 12))
        dataTwo = loraWANV2DataFormat(dataValue.substring(12, 20))
        if (parseInt(dataOne) !== -1000) {
          if (modelName === 'Digital Meter Electricity') {
            let classId = parseInt(dataOne / 1000)
            let targetName = (classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown')
            messages.push({
              measurementValue: dataOne / 1000,
              measurementId: 4164 + parseInt(channelInfoThree.one) + '',
              type: `${targetName} value`
            })
          } else {
            let classId = parseInt(dataOne / 1000)
            let targetName = (classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown')
            messages.push({
              measurementValue: (dataOne / 1000) + 0.01,
              measurementId: 4164 + parseInt(channelInfoThree.one) + '',
              type: `${targetName} Conf`
            })
          }
        }
        if (parseInt(dataTwo) !== -1000 && parseInt(channelInfoThree.two) === 10) {
          messages.push({
            measurementValue: modelName,
            measurementId: 4164 + parseInt(channelInfoThree.two) + '',
            type: `Model Type`
          })
        }
        break
      case '34':
        break
      case '35':
      case '36':
        break
      case '37':
        break
      case '38':
        break
      case '39':
        let electricityWhetherTD = dataValue.substring(0, 2)
        let hwvTD = dataValue.substring(2, 6)
        let bdvTD = dataValue.substring(6, 10)
        let sensorAcquisitionIntervalTD = dataValue.substring(10, 14)
        let gpsAcquisitionIntervalTD = dataValue.substring(14, 18)
        messages = [{
          'Battery(%)': loraWANV2DataFormat(electricityWhetherTD),
          'Hardware Version': `${loraWANV2DataFormat(hwvTD.substring(0, 2))}.${loraWANV2DataFormat(hwvTD.substring(2, 4))}`,
          'Firmware Version': `${loraWANV2DataFormat(bdvTD.substring(0, 2))}.${loraWANV2DataFormat(bdvTD.substring(2, 4))}`,
          'measureInterval': parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalTD)) * 60,
          'thresholdMeasureInterval': parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalTD))
        }]
        break
      case '40':
      case '41':
        break
      case '42':
        break
      case '43':
      case '44':
        break
      case '45':
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
  
  /**
   * channel info
   * @param str
   * @returns {{channelTwo: number, channelOne: number}}
   */
  function loraWANV2ChannelBitFormat (str) {
    let strReverse = bigEndianTransform(str)
    let str2 = toBinary(strReverse)
    let one = parseInt(str2.substring(0, 4), 2)
    let two = parseInt(str2.substring(4, 8), 2)
    let resultInfo = {
      one: one, two: two
    }
    return resultInfo
  }
  
  /**
   * data log status bit
   * @param str
   * @returns {{total: number, level: number, isTH: number}}
   */
  function loraWANV2DataLogBitFormat (str) {
    let strReverse = bigEndianTransform(str)
    let str2 = toBinary(strReverse)
    let isTH = parseInt(str2.substring(0, 1), 2)
    let total = parseInt(str2.substring(1, 5), 2)
    let left = parseInt(str2.substring(5), 2)
    let resultInfo = {
      isTH: isTH, total: total, left: left
    }
    return resultInfo
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

  function getModelInfo (modelId) {
    let modelTable = {
      '60086':{
        modelName:'Person Detection--Swift YOLO',
        task: 'Detection',
        classes:
          {
            "0": "person"
          }
      },
      '60113':{
        modelName:'Digital Meter Electricity',
        task: 'Detection',
        classes:
          {
            "0": "zero",
            "1": "one",
            "2": "two",
            "3": "three",
            "4": "four",
            "5": "five",
            "6": "six",
            "7": "seven",
            "8": "eight",
            "9": "nine"
          }
      },
      '60242':{
        modelName:'Person Detection',
        task: 'Detection',
        classes:
          {
            "0": "Person"
          }

      },
    }
    return modelTable[modelId]
  }