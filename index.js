const express = require('express')
const request = require('request')

const app = express()

app.use(express.json())

app.all('/', async (req, res) => {
  console.log('消息推送', req.body,typeof(req.body))
  console.log(req.body['MsgType'])
  // 从header中取appid，如果from-appid不存在，则不是资源复用场景，可以直接传空字符串，使用环境所属账号发起云调用
  const appid = req.headers['x-wx-from-appid'] || ''
  const { ToUserName, FromUserName, MsgType, Content, CreateTime } = req.body
  console.log('推送接收的账号', ToUserName, '创建时间', CreateTime)
  if (req.body['MsgType']=='event' && req.body['Event']=='user_enter_tempsession'){
    let link = req.body['SessionFrom']
    if(link==''){
      link = 'link'
    }
    await sendmess(appid, {
      touser: FromUserName,
      msgtype: 'text',
      text: {
        content: '「热辣滚烫 108...（净版）.zip」，复制整段内容，打开最新版「夸克APP」即可获取。
无需下载在线播放视频，畅享原画5倍速，支持电视投屏。
/!56b632tfmJ!:/
链接：https://pan.quark.cn/s/89ab00431eeb\n\n这是一个小程序播放器，<a href="weixin://bizmsgmenu?msgmenucontent='+link+'&msgmenuid=1">点我发送您的链接</a>，可以获取播放页面！',
      }
    })
    res.send('success')
  }
  if (MsgType === 'text') {
    
    await sendmess(appid, {
      touser: FromUserName,
      msgtype: 'miniprogrampage',
      miniprogrampage: {
        title: '在线播放',
        pagepath: 'pages/play/play?vdUrl='+Content, // 跟app.json对齐，支持参数，比如pages/index/index?foo=bar
        thumb_media_id: 'w0X_O7SkQ5qzylq54jWjmsCGzV1k1uB2MClIMDAtdTCICbbT-y6blfJpwoJqatO6'
      }
    })
    res.send('success')
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