const express = require('express')
const request = require('request')

const app = express()

app.use(express.json())

app.all('/', async (req, res) => {
  console.log('消息推送', req.body,typeof(req.body))
  console.log(req.body['MsgType'])
  const appid = req.headers['x-wx-from-appid'] || ''
  const { ToUserName, FromUserName, MsgType, Content, CreateTime } = req.body
  console.log('推送接收的账号', ToUserName, '创建时间', CreateTime)
  if (req.body['MsgType']=='event' && req.body['Event']=='user_enter_tempsession'&&req.body['SessionFrom']!=''){
    let link = req.body['SessionFrom']
    await sendmess(appid, {
      touser: FromUserName,
      msgtype: 'text',
      text: {
        content: '热辣滚烫最新链接：https://pan.quark.cn/s/65f34251a00a\n\n这是一个小程序播放器，<a href="weixin://bizmsgmenu?msgmenucontent='+link+'&msgmenuid=1">发送您的链接</a>，可以获取播放页面！',
      }
    })
    res.send('success')
  }
  if (MsgType === 'text') {
    if(Content.substring(0,4)=='http'){
      await sendmess(appid, {
        touser: FromUserName,
        msgtype: 'miniprogrampage',
        miniprogrampage: {
          title: '在线播放',
          pagepath: 'pages/play/play?vdUrl='+Content, // 跟app.json对齐，支持参数，比如pages/index/index?foo=bar
          thumb_media_id: '5YKUNaRk-vfXvPMPNVpBEy_b4uFD7mdc3YHxlJW8iegV647PICyPdA_O0XjYjeMN'
        }
      })
    }else{
      await sendmess(appid, {
        touser: FromUserName,
        msgtype: 'text',
        text: {
          content: '热辣滚烫最新链接：https://pan.quark.cn/s/65f34251a00a\n\n这是一个小程序播放器，<a href="weixin://bizmsgmenu?msgmenucontent='+'https://www.aiyou.ink'+'&msgmenuid=1">发送您的链接</a>，可以获取播放页面！\n请返回小程序再次进入客服页面，才能正常访问！',
        }
      })
    }
  }
})

app.listen(80, function () {
  console.log('服务启动成功！')
})

function sendmess (appid, mess) {
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      url: `http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=${appid}`,
      body: JSON.stringify(mess)
    }, function (error, response) {
      if (error) {
        console.log('接口返回错误', error)
        reject(error.toString())
      } else {
        console.log('接口返回内容', response.body)
        resolve(response.body)
      }
    })
  })
}