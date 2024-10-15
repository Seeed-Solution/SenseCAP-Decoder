function Decode(fPort, bytes, variables) {
  bytes = bytes2HexString(bytes).toLocaleUpperCase();
  var result = {
    'err': 0,
    'payload': bytes,
    'valid': true,
    messages: []
  };
  var splitArray = dataSplit(bytes);
  // data decoder
  var decoderArray = [];
  for (var i = 0; i < splitArray.length; i++) {
    var item = splitArray[i];
    var dataId = item.dataId;
    var dataValue = item.dataValue;
    var messages = dataIdAndDataValueJudge(dataId, dataValue);
    decoderArray.push(messages);
  }
  result.messages = decoderArray;
  return {
    data: result
  };
}

/**
 * data splits
 * @param bytes
 * @returns {*[]}
 */
function dataSplit(bytes) {
  var frameArray = [];
  for (var i = 0; i < bytes.length; i++) {
    var remainingValue = bytes;
    var dataId = remainingValue.substring(0, 2);
    dataId = dataId.toLowerCase();
    var dataValue = void 0;
    var dataObj = {};
    switch (dataId) {
      case '01':
      case '20':
      case '21':
      case '30':
      case '31':
      case '33':
      case '40':
      case '41':
      case '42':
      case '43':
      case '44':
      case '45':
      case '4a':
        dataValue = remainingValue.substring(2, 22);
        bytes = remainingValue.substring(22);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      case '02':
      case '4b':
        dataValue = remainingValue.substring(2, 18);
        bytes = remainingValue.substring(18);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      case '03':
      case '06':
        dataValue = remainingValue.substring(2, 4);
        bytes = remainingValue.substring(4);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      case '05':
      case '34':
        dataValue = bytes.substring(2, 10);
        bytes = remainingValue.substring(10);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      case '04':
      case '10':
      case '32':
      case '35':
      case '36':
      case '37':
      case '38':
      case '39':
        dataValue = bytes.substring(2, 20);
        bytes = remainingValue.substring(20);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      case '4c':
        dataValue = bytes.substring(2, 14);
        bytes = remainingValue.substring(14);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      default:
        dataValue = '9';
        break;
    }
    if (dataValue.length < 2) {
      break;
    }
    frameArray.push(dataObj);
  }
  return frameArray;
}
function dataIdAndDataValueJudge(dataId, dataValue) {
  var messages = [];
  var temperature;
  var humidity;
  var illumination;
  var uv;
  var windSpeed;
  var windDirection;
  var rainfall;
  var airPressure;
  var peakWind;
  var rainAccumulation;
  switch (dataId) {
    case '01':
      temperature = dataValue.substring(0, 4);
      humidity = dataValue.substring(4, 6);
      illumination = dataValue.substring(6, 14);
      uv = dataValue.substring(14, 16);
      windSpeed = dataValue.substring(16, 20);
      messages = [{
        measurementValue: loraWANV2DataFormat(temperature, 10),
        measurementId: '4097',
        type: 'Air Temperature'
      }, {
        measurementValue: loraWANV2DataFormat(humidity),
        measurementId: '4098',
        type: 'Air Humidity'
      }, {
        measurementValue: loraWANV2DataFormat(illumination),
        measurementId: '4099',
        type: 'Light Intensity'
      }, {
        measurementValue: loraWANV2DataFormat(uv, 10),
        measurementId: '4190',
        type: 'UV Index'
      }, {
        measurementValue: loraWANV2DataFormat(windSpeed, 10),
        measurementId: '4105',
        type: 'Wind Speed'
      }];
      break;
    case '02':
      windDirection = dataValue.substring(0, 4);
      rainfall = dataValue.substring(4, 12);
      airPressure = dataValue.substring(12, 16);
      messages = [{
        measurementValue: loraWANV2DataFormat(windDirection),
        measurementId: '4104',
        type: 'Wind Direction Sensor'
      }, {
        measurementValue: loraWANV2DataFormat(rainfall, 1000),
        measurementId: '4113',
        type: 'Rain Gauge'
      }, {
        measurementValue: loraWANV2DataFormat(airPressure, 0.1),
        measurementId: '4101',
        type: 'Barometric Pressure'
      }];
      break;
    case '03':
      var Electricity = dataValue;
      messages = [{
        'Battery(%)': loraWANV2DataFormat(Electricity)
      }];
      break;
    case '04':
      var electricityWhether = dataValue.substring(0, 2);
      var hwv = dataValue.substring(2, 6);
      var bdv = dataValue.substring(6, 10);
      var sensorAcquisitionInterval = dataValue.substring(10, 14);
      var gpsAcquisitionInterval = dataValue.substring(14, 18);
      messages = [{
        'Battery(%)': loraWANV2DataFormat(electricityWhether),
        'Hardware Version': "".concat(loraWANV2DataFormat(hwv.substring(0, 2)), ".").concat(loraWANV2DataFormat(hwv.substring(2, 4))),
        'Firmware Version': "".concat(loraWANV2DataFormat(bdv.substring(0, 2)), ".").concat(loraWANV2DataFormat(bdv.substring(2, 4))),
        'measureInterval': parseInt(loraWANV2DataFormat(sensorAcquisitionInterval)) * 60,
        'gpsInterval': parseInt(loraWANV2DataFormat(gpsAcquisitionInterval)) * 60
      }];
      break;
    case '05':
      var sensorAcquisitionIntervalFive = dataValue.substring(0, 4);
      var gpsAcquisitionIntervalFive = dataValue.substring(4, 8);
      messages = [{
        'measureInterval': parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalFive)) * 60,
        'gpsInterval': parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalFive)) * 60
      }];
      break;
    case '06':
      var errorCode = dataValue;
      var descZh;
      switch (errorCode) {
        case '00':
          descZh = 'CCL_SENSOR_ERROR_NONE';
          break;
        case '01':
          descZh = 'CCL_SENSOR_NOT_FOUND';
          break;
        case '02':
          descZh = 'CCL_SENSOR_WAKEUP_ERROR';
          break;
        case '03':
          descZh = 'CCL_SENSOR_NOT_RESPONSE';
          break;
        case '04':
          descZh = 'CCL_SENSOR_DATA_EMPTY';
          break;
        case '05':
          descZh = 'CCL_SENSOR_DATA_HEAD_ERROR';
          break;
        case '06':
          descZh = 'CCL_SENSOR_DATA_CRC_ERROR';
          break;
        case '07':
          descZh = 'CCL_SENSOR_DATA_B1_NO_VALID';
          break;
        case '08':
          descZh = 'CCL_SENSOR_DATA_B2_NO_VALID';
          break;
        case '09':
          descZh = 'CCL_SENSOR_RANDOM_NOT_MATCH';
          break;
        case '0A':
          descZh = 'CCL_SENSOR_PUBKEY_SIGN_VERIFY_FAILED';
          break;
        case '0B':
          descZh = 'CCL_SENSOR_DATA_SIGN_VERIFY_FAILED';
          break;
        case '0C':
          descZh = 'CCL_SENSOR_DATA_VALUE_HI';
          break;
        case '0D':
          descZh = 'CCL_SENSOR_DATA_VALUE_LOW';
          break;
        case '0E':
          descZh = 'CCL_SENSOR_DATA_VALUE_MISSED';
          break;
        case '0F':
          descZh = 'CCL_SENSOR_ARG_INVAILD';
          break;
        case '10':
          descZh = 'CCL_SENSOR_RS485_MASTER_BUSY';
          break;
        case '11':
          descZh = 'CCL_SENSOR_RS485_REV_DATA_ERROR';
          break;
        case '12':
          descZh = 'CCL_SENSOR_RS485_REG_MISSED';
          break;
        case '13':
          descZh = 'CCL_SENSOR_RS485_FUN_EXE_ERROR';
          break;
        case '14':
          descZh = 'CCL_SENSOR_RS485_WRITE_STRATEGY_ERROR';
          break;
        case '15':
          descZh = 'CCL_SENSOR_CONFIG_ERROR';
          break;
        case 'FF':
          descZh = 'CCL_SENSOR_DATA_ERROR_UNKONW';
          break;
        default:
          descZh = 'CC_OTHER_FAILED';
          break;
      }
      messages = [{
        measurementId: '4101',
        type: 'sensor_error_event',
        errCode: errorCode,
        descZh: descZh
      }];
      break;
    case '10':
      var statusValue = dataValue.substring(0, 2);
      var _loraWANV2BitDataForm = loraWANV2BitDataFormat(statusValue),
          status = _loraWANV2BitDataForm.status,
          type = _loraWANV2BitDataForm.type;
      var sensecapId = dataValue.substring(2);
      messages = [{
        status: status,
        channelType: type,
        sensorEui: sensecapId
      }];
      break;
    case '4a':
      temperature = dataValue.substring(0, 4);
      humidity = dataValue.substring(4, 6);
      illumination = dataValue.substring(6, 14);
      uv = dataValue.substring(14, 16);
      windSpeed = dataValue.substring(16, 20);
      messages = [{
        measurementValue: loraWANV2DataFormat(temperature, 10),
        measurementId: '4097',
        type: 'Air Temperature'
      }, {
        measurementValue: loraWANV2DataFormat(humidity),
        measurementId: '4098',
        type: 'Air Humidity'
      }, {
        measurementValue: loraWANV2DataFormat(illumination),
        measurementId: '4099',
        type: 'Light Intensity'
      }, {
        measurementValue: loraWANV2DataFormat(uv, 10),
        measurementId: '4190',
        type: 'UV Index'
      }, {
        measurementValue: loraWANV2DataFormat(windSpeed, 10),
        measurementId: '4105',
        type: 'Wind Speed'
      }];
      break;
    case '4b':
      windDirection = dataValue.substring(0, 4);
      rainfall = dataValue.substring(4, 12);
      airPressure = dataValue.substring(12, 16);
      messages = [{
        measurementValue: loraWANV2DataFormat(windDirection),
        measurementId: '4104',
        type: 'Wind Direction Sensor'
      }, {
        measurementValue: loraWANV2DataFormat(rainfall, 1000),
        measurementId: '4113',
        type: 'Rain Gauge'
      }, {
        measurementValue: loraWANV2DataFormat(airPressure, 0.1),
        measurementId: '4101',
        type: 'Barometric Pressure'
      }];
      break;
    case '4c':
      peakWind = dataValue.substring(0, 4);
      rainAccumulation = dataValue.substring(4, 12);
      messages = [{
        measurementValue: loraWANV2DataFormat(peakWind, 10),
        measurementId: '4191',
        type: ' Peak Wind Gust'
      }, {
        measurementValue: loraWANV2DataFormat(rainAccumulation, 1000),
        measurementId: '4213',
        type: 'Rain Accumulation'
      }];
      break;
    default:
      break;
  }
  return messages;
}

/**
 *
 * data formatting
 * @param str
 * @param divisor
 * @returns {string|number}
 */
function loraWANV2DataFormat(str) {
  var divisor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var strReverse = bigEndianTransform(str);
  var str2 = toBinary(strReverse);
  if (str2.substring(0, 1) === '1') {
    var arr = str2.split('');
    var reverseArr = arr.map(function (item) {
      if (parseInt(item) === 1) {
        return 0;
      } else {
        return 1;
      }
    });
    str2 = parseInt(reverseArr.join(''), 2) + 1;
    return parseFloat('-' + str2 / divisor);
  }
  return parseInt(str2, 2) / divisor;
}

/**
 * Handling big-endian data formats
 * @param data
 * @returns {*[]}
 */
function bigEndianTransform(data) {
  var dataArray = [];
  for (var i = 0; i < data.length; i += 2) {
    dataArray.push(data.substring(i, i + 2));
  }
  // array of hex
  return dataArray;
}

/**
 * Convert to an 8-digit binary number with 0s in front of the number
 * @param arr
 * @returns {string}
 */
function toBinary(arr) {
  var binaryData = arr.map(function (item) {
    var data = parseInt(item, 16).toString(2);
    var dataLength = data.length;
    if (data.length !== 8) {
      for (var i = 0; i < 8 - dataLength; i++) {
        data = "0" + data;
      }
    }
    return data;
  });
  var ret = binaryData.toString().replace(/,/g, '');
  return ret;
}

/**
 * sensor
 * @param str
 * @returns {{channel: number, type: number, status: number}}
 */
function loraWANV2BitDataFormat(str) {
  var strReverse = bigEndianTransform(str);
  var str2 = toBinary(strReverse);
  var channel = parseInt(str2.substring(0, 4), 2);
  var status = parseInt(str2.substring(4, 5), 2);
  var type = parseInt(str2.substring(5), 2);
  return {
    channel: channel,
    status: status,
    type: type
  };
}

/**
 * channel info
 * @param str
 * @returns {{channelTwo: number, channelOne: number}}
 */
function loraWANV2ChannelBitFormat(str) {
  var strReverse = bigEndianTransform(str);
  var str2 = toBinary(strReverse);
  var one = parseInt(str2.substring(0, 4), 2);
  var two = parseInt(str2.substring(4, 8), 2);
  var resultInfo = {
    one: one,
    two: two
  };
  return resultInfo;
}

/**
 * data log status bit
 * @param str
 * @returns {{total: number, level: number, isTH: number}}
 */
function loraWANV2DataLogBitFormat(str) {
  var strReverse = bigEndianTransform(str);
  var str2 = toBinary(strReverse);
  var isTH = parseInt(str2.substring(0, 1), 2);
  var total = parseInt(str2.substring(1, 5), 2);
  var left = parseInt(str2.substring(5), 2);
  var resultInfo = {
    isTH: isTH,
    total: total,
    left: left
  };
  return resultInfo;
}
function bytes2HexString(arrBytes) {
  var str = '';
  for (var i = 0; i < arrBytes.length; i++) {
    var tmp;
    var num = arrBytes[i];
    if (num < 0) {
      tmp = (255 + num + 1).toString(16);
    } else {
      tmp = num.toString(16);
    }
    if (tmp.length === 1) {
      tmp = '0' + tmp;
    }
    str += tmp;
  }
  return str;
}