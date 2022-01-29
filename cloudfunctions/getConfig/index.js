// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const configKey = event.id
  var value = event.defaultValue
  const db = cloud.database()
  console.log('key: '+ configKey + ' default value: ' + value)

  var values =  await db.collection('config').where({
    config_key: configKey
  }).get()

  if(values.data.length != 0) {
      console.log('value: ' + values.data[0].config_value)
      value = values.data[0].config_value
  }
  return {value}
}