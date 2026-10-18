# 提示块与徽章

## 提示块

::: info
普通说明，补充上下文。
:::

::: tip
建议做法，配色跟随品牌色，其中的[链接](./index.md)与 `code` 也一样。
:::

::: warning
需要留意的地方，例如升级须知。
:::

::: danger
破坏性变更或不可逆操作。
:::

::: details 展开查看
折叠起来的补充内容。
:::

## 徽章

正文里的徽章：稳定版 <Badge type="tip" text="稳定版" />、预览版 <Badge type="warning" text="预览版" />、开发版 <Badge type="danger" text="开发版" />、说明 <Badge type="info" text="说明" />。

导航栏「预览」右上角的标记是导航徽章，写法是在导航标题后拼一段：

```html
<span class="xh-nav-badge xh-nav-badge--tip">稳定版</span>
```

配色取 `tip`、`warning`、`danger` 三种。

## 可全屏的示例

用 `<XhFullscreen>` 包住示例，右上角出一颗「全屏查看」按钮，全屏后示例铺满屏幕，Esc 或再点按钮退出：

<XhFullscreen>
  <div class="playground-stage">示例舞台：全屏后跟着屏幕长高</div>
</XhFullscreen>

全屏时组件根上有 `data-fullscreen`，正文是一列弹性盒；要跟着屏幕长高的内容写 `flex: 1`：

```css
.xh-fullscreen[data-fullscreen] .playground-stage {
  flex: 1 1 auto;
  height: auto;
}
```
