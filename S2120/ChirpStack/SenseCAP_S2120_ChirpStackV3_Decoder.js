function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Entry, decoder.js
 */
function Decode(fPort, bytes, variables) {
  // data split

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
        dataValue = remainingValue.substring(2, 22);
        bytes = remainingValue.substring(22);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      case '02':
        dataValue = remainingValue.substring(2, 18);
        bytes = remainingValue.substring(18);
        dataObj = {
          'dataId': '02',
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
  var _ref, _ref2, _ref3;
  var messages = [];
  switch (dataId) {
    case '01':
      var temperature = dataValue.substring(0, 4);
      var humidity = dataValue.substring(4, 6);
      var illumination = dataValue.substring(6, 14);
      var uv = dataValue.substring(14, 16);
      var windSpeed = dataValue.substring(16, 20);
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
      var windDirection = dataValue.substring(0, 4);
      var rainfall = dataValue.substring(4, 12);
      var airPressure = dataValue.substring(12, 16);
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
    case '20':
      var initmeasurementId = 4175;
      var sensor = [];
      for (var i = 0; i < dataValue.length; i += 4) {
        var modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2));
        var detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4));
        var aiHeadValues = "".concat(modelId, ".").concat(detectionType);
        sensor.push({
          measurementValue: aiHeadValues,
          measurementId: initmeasurementId
        });
        initmeasurementId++;
      }
      messages = sensor;
      break;
    case '21':
      // Vision AI:
      // AI 识别输出帧
      var tailValueArray = [];
      var initTailmeasurementId = 4180;
      for (var _i = 0; _i < dataValue.length; _i += 4) {
        var _modelId = loraWANV2DataFormat(dataValue.substring(_i, _i + 2));
        var _detectionType = loraWANV2DataFormat(dataValue.substring(_i + 2, _i + 4));
        var aiTailValues = "".concat(_modelId, ".").concat(_detectionType);
        tailValueArray.push({
          measurementValue: aiTailValues,
          measurementId: initTailmeasurementId,
          type: "AI Detection ".concat(_i)
        });
        initTailmeasurementId++;
      }
      messages = tailValueArray;
      break;
    case '30':
    case '31':
      // 首帧或者首帧输出帧
      var channelInfoOne = loraWANV2ChannelBitFormat(dataValue.substring(0, 2));
      var dataOne = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(4, 12), 1000),
        measurementId: parseInt(channelInfoOne.one),
        type: 'Measurement'
      };
      var dataTwo = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(12, 20), 1000),
        measurementId: parseInt(channelInfoOne.two),
        type: 'Measurement'
      };
      var cacheArrayInfo = [];
      if (parseInt(channelInfoOne.one)) {
        cacheArrayInfo.push(dataOne);
      }
      if (parseInt(channelInfoOne.two)) {
        cacheArrayInfo.push(dataTwo);
      }
      cacheArrayInfo.forEach(function (item) {
        messages.push(item);
      });
      break;
    case '32':
      var channelInfoTwo = loraWANV2ChannelBitFormat(dataValue.substring(0, 2));
      var dataThree = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        measurementId: parseInt(channelInfoTwo.one),
        type: 'Measurement'
      };
      var dataFour = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(10, 18), 1000),
        measurementId: parseInt(channelInfoTwo.two),
        type: 'Measurement'
      };
      if (parseInt(channelInfoTwo.one)) {
        messages.push(dataThree);
      }
      if (parseInt(channelInfoTwo.two)) {
        messages.push(dataFour);
      }
      break;
    case '33':
      var channelInfoThree = loraWANV2ChannelBitFormat(dataValue.substring(0, 2));
      var dataFive = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(4, 12), 1000),
        measurementId: parseInt(channelInfoThree.one),
        type: 'Measurement'
      };
      var dataSix = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(12, 20), 1000),
        measurementId: parseInt(channelInfoThree.two),
        type: 'Measurement'
      };
      if (parseInt(channelInfoThree.one)) {
        messages.push(dataFive);
      }
      if (parseInt(channelInfoThree.two)) {
        messages.push(dataSix);
      }
      break;
    case '34':
      var model = loraWANV2DataFormat(dataValue.substring(0, 2));
      var GPIOInput = loraWANV2DataFormat(dataValue.substring(2, 4));
      var simulationModel = loraWANV2DataFormat(dataValue.substring(4, 6));
      var simulationInterface = loraWANV2DataFormat(dataValue.substring(6, 8));
      messages = [{
        'dataloggerProtocol': model,
        'dataloggerGPIOInput': GPIOInput,
        'dataloggerAnalogType': simulationModel,
        'dataloggerAnalogInterface': simulationInterface
      }];
      break;
    case '35':
    case '36':
      var channelTDOne = loraWANV2ChannelBitFormat(dataValue.substring(0, 2));
      var channelSortTDOne = 3920 + (parseInt(channelTDOne.one) - 1) * 2;
      var channelSortTDTWO = 3921 + (parseInt(channelTDOne.one) - 1) * 2;
      messages = [(_ref = {}, _defineProperty(_ref, channelSortTDOne, loraWANV2DataFormat(dataValue.substring(2, 10), 1000)), _defineProperty(_ref, channelSortTDTWO, loraWANV2DataFormat(dataValue.substring(10, 18), 1000)), _ref)];
      break;
    case '37':
      var channelTDInfoTwo = loraWANV2ChannelBitFormat(dataValue.substring(0, 2));
      var channelSortOne = 3920 + (parseInt(channelTDInfoTwo.one) - 1) * 2;
      var channelSortTWO = 3921 + (parseInt(channelTDInfoTwo.one) - 1) * 2;
      messages = [(_ref2 = {}, _defineProperty(_ref2, channelSortOne, loraWANV2DataFormat(dataValue.substring(2, 10), 1000)), _defineProperty(_ref2, channelSortTWO, loraWANV2DataFormat(dataValue.substring(10, 18), 1000)), _ref2)];
      break;
    case '38':
      var channelTDInfoThree = loraWANV2ChannelBitFormat(dataValue.substring(0, 2));
      var channelSortThreeOne = 3920 + (parseInt(channelTDInfoThree.one) - 1) * 2;
      var channelSortThreeTWO = 3921 + (parseInt(channelTDInfoThree.one) - 1) * 2;
      messages = [(_ref3 = {}, _defineProperty(_ref3, channelSortThreeOne, loraWANV2DataFormat(dataValue.substring(2, 10), 1000)), _defineProperty(_ref3, channelSortThreeTWO, loraWANV2DataFormat(dataValue.substring(10, 18), 1000)), _ref3)];
      break;
    case '39':
      var electricityWhetherTD = dataValue.substring(0, 2);
      var hwvTD = dataValue.substring(2, 6);
      var bdvTD = dataValue.substring(6, 10);
      var sensorAcquisitionIntervalTD = dataValue.substring(10, 14);
      var gpsAcquisitionIntervalTD = dataValue.substring(14, 18);
      messages = [{
        'Battery(%)': loraWANV2DataFormat(electricityWhetherTD),
        'Hardware Version': "".concat(loraWANV2DataFormat(hwvTD.substring(0, 2)), ".").concat(loraWANV2DataFormat(hwvTD.substring(2, 4))),
        'Firmware Version': "".concat(loraWANV2DataFormat(bdvTD.substring(0, 2)), ".").concat(loraWANV2DataFormat(bdvTD.substring(2, 4))),
        'measureInterval': parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalTD)) * 60,
        'thresholdMeasureInterval': parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalTD))
      }];
      break;
    case '40':
    case '41':
      var lightIntensity = dataValue.substring(0, 4);
      var loudness = dataValue.substring(4, 8);
      // X
      var accelerateX = dataValue.substring(8, 12);
      // Y
      var accelerateY = dataValue.substring(12, 16);
      // Z
      var accelerateZ = dataValue.substring(16, 20);
      messages = [{
        measurementValue: loraWANV2DataFormat(lightIntensity),
        measurementId: '4193',
        type: 'Light Intensity'
      }, {
        measurementValue: loraWANV2DataFormat(loudness),
        measurementId: '4192',
        type: 'Sound Intensity'
      }, {
        measurementValue: loraWANV2DataFormat(accelerateX, 100),
        measurementId: '4150',
        type: 'AccelerometerX'
      }, {
        measurementValue: loraWANV2DataFormat(accelerateY, 100),
        measurementId: '4151',
        type: 'AccelerometerY'
      }, {
        measurementValue: loraWANV2DataFormat(accelerateZ, 100),
        measurementId: '4152',
        type: 'AccelerometerZ'
      }];
      break;
    case '42':
      var airTemperature = dataValue.substring(0, 4);
      var AirHumidity = dataValue.substring(4, 8);
      var tVOC = dataValue.substring(8, 12);
      var CO2eq = dataValue.substring(12, 16);
      var soilMoisture = dataValue.substring(16, 20);
      messages = [{
        measurementValue: loraWANV2DataFormat(airTemperature, 100),
        measurementId: '4097',
        type: 'Air Temperature'
      }, {
        measurementValue: loraWANV2DataFormat(AirHumidity, 100),
        measurementId: '4098',
        type: 'Air Humidity'
      }, {
        measurementValue: loraWANV2DataFormat(tVOC),
        measurementId: '4195',
        type: 'Total Volatile Organic Compounds'
      }, {
        measurementValue: loraWANV2DataFormat(CO2eq),
        measurementId: '4100',
        type: 'CO2'
      }, {
        measurementValue: loraWANV2DataFormat(soilMoisture),
        measurementId: '4196',
        type: 'Soil moisture intensity'
      }];
      break;
    case '43':
    case '44':
      var headerDevKitValueArray = [];
      var initDevkitmeasurementId = 4175;
      for (var _i2 = 0; _i2 < dataValue.length; _i2 += 4) {
        var _modelId2 = loraWANV2DataFormat(dataValue.substring(_i2, _i2 + 2));
        var _detectionType2 = loraWANV2DataFormat(dataValue.substring(_i2 + 2, _i2 + 4));
        var _aiHeadValues = "".concat(_modelId2, ".").concat(_detectionType2);
        headerDevKitValueArray.push({
          measurementValue: _aiHeadValues,
          measurementId: initDevkitmeasurementId,
          type: "AI Detection ".concat(_i2)
        });
        initDevkitmeasurementId++;
      }
      messages = headerDevKitValueArray;
      break;
    case '45':
      var initTailDevKitmeasurementId = 4180;
      for (var _i3 = 0; _i3 < dataValue.length; _i3 += 4) {
        var _modelId3 = loraWANV2DataFormat(dataValue.substring(_i3, _i3 + 2));
        var _detectionType3 = loraWANV2DataFormat(dataValue.substring(_i3 + 2, _i3 + 4));
        var _aiTailValues = "".concat(_modelId3, ".").concat(_detectionType3);
        messages.push({
          measurementValue: _aiTailValues,
          measurementId: initTailDevKitmeasurementId,
          type: "AI Detection ".concat(_i3)
        });
        initTailDevKitmeasurementId++;
      }
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