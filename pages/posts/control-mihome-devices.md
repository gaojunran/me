---
title: 快来控制我的台灯吧！
date: 2025-06-10T00:00:00Z
lang: zh
duration: 10min
---

去年年末，小米开源了 [米家对 Home Assistant 的支持](https://github.com/XiaoMi/ha_xiaomi_home) ，使得我们可以使用 Home Assistant 来控制米家设备。

> 这是一些概念的解释，如果你之前没用过 Home Assistant：
>
> - Home Assistant 和米家相比，是一个**开源**的、**开放性更强**的智能家居平台，可以通过集成各个品牌的设备来集中管理和控制。
> - 米家是小米公司推出的智能家居平台。你可以使用小米手机或其它安装了米家 App 的设备来控制米家设备。
> - Home Assistant 以 OS 和 Docker 两种方式提供。

这篇文章，就让我们一起连入 Home Assistant，并做一个有趣的、可以在公网访问米家设备的小按钮吧！

## 安装 HomeAssistant

Home Assistant 提供了 OS 和 Docker 两种方式来安装。我实测下来 OS 的虚拟机安装方式不仅麻烦，还没成功接入米家（可能是我自己的问题...）。不过还是 Docker 方便，让我们来用 Docker 吧！

如果你使用的是 MacOS，强烈建议使用 [OrbStack](https://www.orbstack.dev/) 这个容器管理工具，它与 MacOS 深度集成，帮你管理好了网络端口映射等问题。

参考 [官方文档](https://www.home-assistant.io/installation/linux#platform-installation) 来启动 Docker 容器：

```bash
docker run -d \
  --name homeassistant \
  --privileged \
  --restart=unless-stopped \
  -e TZ=Asia/Shanghai \
  -v /PATH_TO_YOUR_CONFIG:/config \
  -v /run/dbus:/run/dbus:ro \
  --network=host \
  ghcr.io/home-assistant/home-assistant:stable
```

其中我们需要把 `/PATH_TO_YOUR_CONFIG` 替换为你在容器的宿主机中存放配置文件的路径。访问 `localhost:8123`，如果能看到正常加载的网页，就是安装成功了。

在管理页面中新建一个家庭，进入管理面板页面。

[米家集成](https://github.com/XiaoMi/ha_xiaomi_home) 中给了我们多种集成米家的方式。这里我们使用第一种。进入容器的 Shell 中：

```bash
cd config
git clone https://github.com/XiaoMi/ha_xiaomi_home.git
cd ha_xiaomi_home
./install.sh /config
```

<div class="py-2" />

> [!warning]
> 注意，要在容器的 Shell 中执行上述命令，而不是在宿主机的 Shell 中（即使是映射的 `/config` 目录）。安装后要**重启** Home Assistant 容器。

在管理面板中的 [设置 -> 设备与服务 -> 集成](http://localhost:8123/config/integrations/dashboard) 中点击右下角的添加集成，搜索 `Xiaomi Home`，再配置小米账号和添加的设备即可。

现在我们就可以在 Home Assistant 中控制米家设备了！

<img class="mx-auto" src="/images/control-mihome-devices/image.png" />

---

## 使用 HomeAssistant API

HomeAssistant API 以标准 Restful 的形式提供。你只需要发起一个 HTTP 请求，携带 JWT Token、设备 ID 等必要参数，就可以查看设备信息、或控制设备。

如果你想查看台灯的信息：

```http
GET /api/states/light.philips_cn_274401208_sread2_s_2_light HTTP/1.1
Host: localhost:8123
Authorization: Bearer <...>
Content-Type: application/json
```

如果你想控制台灯的开关状态：

```http
POST /api/services/light/toggle HTTP/1.1
Host: localhost:8123
Authorization: Bearer <...>
Content-Type: application/json

{"entity_id": "light.philips_cn_274401208_sread2_s_2_light"}
```

> 可以在 [这里](http://localhost:8123/profile/security) 创建一个**长期访问令牌**，拿到 Token 后就可以在请求中使用了。

> `light.philips_cn_274401208_sread2_s_2_light` 是实体标识符，能唯一标识一个设备。可以在管理面板中点开一个设备，在设置中找到这个标识符。也可以在 API 「列出全部设备信息」的响应中获得。

## 使用键盘控制设备

既然有了 API，在各种场景中调用来实现自动化就非常简单了！这里我们以 Hammerspoon + nushell 为例：

```nushell
def mihome-post [
  url_part: string,
  data: string
] {
  http post $"http://localhost:8123/api/services/($url_part)" $data --headers [
    Authorization $"Bearer ($env.HOMEASSISTANT_TOKEN)"
    "Content-Type" "application/json"
  ]
}

export def lamp [state?: string] {
  if $state == null {  # toggle by default
    mihome-post "light/toggle" ({
      "entity_id": $"light.($env.MIHOME_LAMP_ID)"
    } | to json)
  } # else TODO
}
```

这里我们用 nushell 做了一个简易的命令行小工具，通过 `lamp` 命令发起 HTTP 请求，来控制台灯的开关。

```lua
hs.hotkey.bind({}, "F8", function()
  hs.execute("mise exec -- nu -l -c lamp", true)
  -- use mise to capture env vars
end)
```

接着，我们用 Hammerspoon 绑定快捷键，按下 F8 就可以控制台灯了。我使用 `mise` 来管理我的隐私环境变量（如`TOKEN`等），所以在执行命令时使用了 `mise exec`。

对于 Windows 用户也可以使用 AutoHotKey 等实用工具来实现绑定快捷键的功能，在此不再赘述。Hammerspoon 作为 macOS 的实用工具，还有相当多的自动化功能，你可以将其与 Home Assistant 结合，实现更多有趣的自动化功能。

## 难题一：内网穿透

> 此部分内容面向没有云服务器使用经验的小白用户！

回想一下，我们此前将 Home Assistant 安装在家中的**个人设备**中了。不安装在云服务器上的好处是，我们可以通过蓝牙等近场方式控制家中的设备；但缺点是无法从公网中访问 Home Assistant 来控制设备。

> 云服务器和个人设备最明显的区别是**是否有公网 IP**。云服务器会绑定一个公网 IP，允许**互联网上的任何设备**访问**其开放的端口**；而个人设备通常只能在局域网中进行访问。

<AiResult provider="chatgpt" url="https://chatgpt.com/share/684b0250-6290-8010-8466-c5a228066dc8" title="云服务器和个人 Linux 设备的最大区别是什么？" />

既然安装在个人设备中、又想从公网访问，那么我们就可以使用**内网穿透**技术了。内网穿透的一种典型方式是反向代理。

考虑一下，公网设备如何访问内网的设备呢？由于 NAT 的限制，内网的 IP 无法直接被公网访问。但我们可以使用云服务器作为中转，让内网设备主动发起连接并建立隧道。当外网用户访问中转服务器时，服务器再通过这个反向连接将请求转发给内网服务。这就是内网穿透的原理！

内网穿透的工具有很多，如 [ngrok](https://ngrok.com/)、[frp](https://github.com/fatedier/frp) 等。如果你没有云服务器，[ngrok](https://ngrok.com/) 对开发者免费，是一个不错的工具。本教程中我们在有云服务器的情况下，使用一个更为简单的、仅 400 行代码的工具 [bore](https://github.com/ekzhang/bore)。

> 借助于强大的库 Tokio，bore 可以在 400 行代码内实现内网穿透的基本功能。我之后会专门发一篇文章讲这个工具内部的实现原理。

在云服务器上，启动 `bore` 的服务端：

```bash
bore server --min-port 8081 --max-port 8081
```

在已安装 Home Assistant 的设备中，启动 `bore` 的客户端：

```bash
bore local 8123 --to <你的云服务器公网IP>
```

这样我们就将位于 8123 端口的 Home Assistant 服务暴露到了公网中，可以通过 `http://<你的公网IP>:8081` 访问 Home Assistant 了。

## 难题二：反向代理

我们不满足于使用公网 IP + 端口号来访问 Home Assistant，我们希望使用 域名 + 路径 的形式来访问。这里我们省去绑定域名的步骤，来讲讲怎么实现将 `http://...:8081` 转发到 `http://.../mihome`，这个需求就是反向代理。

我们通常用 [Nginx](https://nginx.org/) 来实现反向代理。但 Nginx 的配置不够简洁。这里我们使用一个更轻量级的工具 [Caddy](https://caddyserver.com/) 来实现反向代理：

```
:80 {
    handle_path /mihome/* {
        reverse_proxy localhost:8081 {
            header_up Host 127.0.0.1:8081
        }
    }

    reverse_proxy /api/* localhost:8080
}
```

`http://.../mihome` 本质上是 `http://...:80/mihome`，因为 80 端口是 HTTP 的默认端口。所以我们使用 Caddy 监听 80 端口，将发往 80 端口的 `/mihome/*` 请求转发到 8081 端口。`handle_path` 可以把 `/mihome` 这部分去掉作为新的路径。

不要把自己绕晕了！Home Assistant 服务经历了这样的网络传输：

本机的 8123 端口 --- **内网穿透** ---> 云服务器的 8081 端口 --- **反向代理** ---> 云服务器的 80 端口

🎉 现在你可以通过 `http://<你的公网IP>/mihome/api/...` 来访问 Home Assistant 的 API 了！

## 难题三：跨域

看似问题已经解决，实则我们还有最后一个难题：如果在浏览器 JavaScript 中使用 `fetch`，携带 Token 访问 Home Assistant API，会出现跨域问题。而通常情况下，我们需要服务端配置 CORS 来解决这个问题，但是服务端的 Home Assistant 面向智能家居，没有提供这样的功能。

第一种方案，我们可以使用 `Caddy` 在反向代理 `/mihome` 到 8081 端口的同时，为响应体加上 `Access-Control-Allow-Origin` 头，允许跨域访问。

但这样做还是不可避免地将 HomeAssistant Token 暴露在前端，这并不是我们想要的。可以使用一个简单的后端服务器来实现。这里使用了 [Robyn](https://robyn.tech/)，这是一个以高性能 Rust 驱动的 Python 服务端。

看下代码：

```python
import os

import requests
from dotenv import load_dotenv
from robyn import ALLOW_CORS, Robyn

load_dotenv()
app = Robyn(__file__)

ALLOW_CORS(app, "*")  # 这里可以换成前端域名

@app.get("/api/blog/test-mihome")
def test_mihome():
    url = "http://localhost:8081/api/services/light/toggle"
    token = os.getenv("HOMEASSISTANT_TOKEN")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    data = {"entity_id": os.getenv("MIHOME_LAMP_ID")}
    response = requests.post(url, headers=headers, json=data)
    return {"code": response.status_code, "data": response.text}

if __name__ == "__main__":
    app.start(host="0.0.0.0", port=8080)
```

非常简洁的代码！使用 `ALLOW_CORS` 函数允许跨域访问，而在此服务器进程中可以再向 8081 端口发起请求，从而避免了 Token 暴露和跨域的问题。

接着使用 Vue 编写一个简单的按钮来控制我的台灯：

```vue
<script setup>
const state = ref('Click me!')

function toggleLamp() {
  fetch('http://123.249.70.0/api/blog/test-mihome')
    .then(res => res.json())
    .then((res) => {
      const rawState = JSON.parse(res.data)?.[0]?.state
      if (rawState === 'off') {
        state.value = 'OFF'
      }
      else if (rawState === 'on') {
        state.value = 'ON'
      }
    })
    .catch(() => {
      state.value = 'Error'
    })
}
</script>

<template>
  <div class="flex justify-center my-2">
    <button :disabled="new Date().getHours() >= 0 && new Date().getHours() <= 8" class="..." @click="toggleLamp">
      {{ state }}
    </button>
  </div>
</template>
```

来试试这个按钮吧！

<LampButton />
