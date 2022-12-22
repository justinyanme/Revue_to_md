# Revue_to_md
可以把 [Revue](https://www.getrevue.co/) 上所有的 issues 下载保存为 Markdown 文件，支持自动下载图片。

- ✅将API结果保存到 `data.json`
- ✅把所有Issue保存为Markdown文件
- ✅支持导出所有订阅者列表 `subscribers.json`
- ✅自动下载所有图片

## ⚠️事前准备

这个项目需要你有 **Revue API TOKEN** 才能运行。

你可以在这个页面的底部找到你的API Token: [getrevue.co/app/integrations](https://www.getrevue.co/app/integrations).

![](revue_token.png)

## 安装与配置

1. 安装依赖

```
git clone git@github.com:justinyanme/Revue_to_md.git
cd Revue_to_md
npm install
```

2. 复制并编辑 `config.json`

```
cp config.sample.json config.json
vi config.json
```

把 `<your-revue-api-token>` 换成你的 Token。

```json
{
    "log": {
        "level": "info",
        "hostname": "R2MD"
    },
    "revue": {
        "token": "<your-revue-api-token>"
    }
}
```

## 使用方法

运行前请先编译一次，以后就不需要编译了。

```
npm run build
```

编译完成后，直接运行: `node built/index.js`

```
node built/index.js

index <cmd> [args]

Commands:
  index listIssues  列出所有Issues
  index saveInMD    保存所有Issues为Markdown文件
  index exportSubscriberList  导出订阅者列表到 out/subscribers.json

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

如果想要自动下载图片，可以带上 `-i` flag:

```
node built/index.js saveInMD -i
```

所有文件将保存在项目的 `out` 目录。