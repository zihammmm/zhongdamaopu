// const { fail } = require("assert");

const verifyTplId = 'nL_jxxqauXyl5knCQpfM0yVIFQp5uKvSsSOTHIH__PQ'; //审核结果通知模板Id
const feedbackTplId = '6Z_QwuL-88UZmv0VLZinasgc8tk7RKKNT4jclIYAHx0'; // 反馈回复结果模板Id
const notifyVerifyTplId = 'ii9KUv3GuQPLNpJPThnyi70TpKe8lkPMuEZKPybQB0E' // 提醒审核模版Id
const notifyChkFeedbackTplId = 'ii9KUv3GuQPLNpJPThnyi4b0NZTlVjGHH_v03aAhOvg' // 提醒处理反馈模版Id

async function requestNotice(template) {
  var tplId;
  if (template == 'verify') {
    tplId = verifyTplId;
  } else if (template == 'notifyVerify') {
    tplId = notifyVerifyTplId;
  } else if (template == 'notifyChkFeedback') {
    tplId = notifyChkFeedbackTplId;
  } else {
    tplId = feedbackTplId;
  }

  let res = await wx.requestSubscribeMessage({
    tmplIds: [tplId],
  });
  // let res;
  // wx.requestSubscribeMessage({
  //   tmplIds: [tplId],
  //   success: response=>{
  //     res = response
  //   }
  // });
  // BUG：反馈页Android端存在res：undefined并无法完成反馈的情况
  console.log("requestSubMsgRes:", res);
  if (res.errMsg != 'requestSubscribeMessage:ok') {
    console.log('调用消息订阅请求接口失败' + res.errCode);
    await wx.showToast({
      title: '消息订阅好像出了点问题',
      icon: 'none',
      duration: 500,
    })
    return false;
  }
  if (res[tplId] == 'accept') {
    await wx.showToast({
      title: '结果能通知你啦',
      icon: 'success',
      duration: 800,
    })
    return true;
  } else {
    await wx.showToast({
      title: '你拒收了通知QAQ',
      icon: 'none',
      duration: 800,
    })
    return false;
  }
}

// 发送审核消息
function sendVerifyNotice(notice_list) {
  const openids = Object.keys(notice_list);
  if (!openids.length) {
    return false;
  }
  const db = wx.cloud.database();
  const _ = db.command;
  // 获取需要发送的list
  for (const openid of openids) {
    wx.cloud.callFunction({
      name: 'sendMsg',
      data: {
        openid: openid,
        tplId: verifyTplId,
        content: notice_list[openid]
      }
    });
  }
}

// 发送回复消息
async function sendReplyNotice(openid, fb_id, reply) {
  const db = wx.cloud.database();
  const _ = db.command;
  let res = await wx.cloud.callFunction({
    name: 'sendMsg',
    data: {
      openid: openid,
      tplId: feedbackTplId,
      fb_id: fb_id,
      reply: reply
    }
  });
  return res.result;
}

// 发送提醒审核消息
function sendNotifyVertifyNotice(numUnchkPhotos) {
  const db = wx.cloud.database();
  const _ = db.command;
  let res = wx.cloud.callFunction({
    name: 'sendMsg',
    data: {
      numUnchkPhotos: numUnchkPhotos,
      tplId: notifyVerifyTplId,
    },
    success: res => {
      console.log("callSendMsgSuccess:", res);
    },
    fail: res => {
      console.log("callSendMsgFail:", res);
    }
  });
  return res;
}

module.exports = {
  requestNotice,
  sendVerifyNotice,
  sendReplyNotice,
  sendNotifyVertifyNotice,
  notifyVerifyTplId,
  notifyChkFeedbackTplId
}