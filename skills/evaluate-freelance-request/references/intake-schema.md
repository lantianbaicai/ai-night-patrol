# 私活需求记录结构

用于把聊天、截图、文档和口述信息整理成可评估记录。没有证据的字段保持 `unknown`，不要猜成事实。

## 最小记录

```json
{
  "title": "项目简称",
  "source": "微信群聊天 + 客户附件",
  "goal": "客户最终想得到的结果",
  "facts": ["客户明确说过的内容"],
  "assumptions": ["为了评估而暂时采用的假设"],
  "unknowns": ["会改变方案、价格或验收的问题"],
  "inputs": ["表格", "图片", "账号"],
  "outputs": ["网页", "脚本", "报表"],
  "users": ["运营人员"],
  "platforms": ["目标平台"],
  "volume": "unknown",
  "deadline": "unknown",
  "budget": "unknown",
  "acceptance": "unknown"
}
```

## 评分脚本字段

`scripts/score_request.py` 接受下列布尔字段。未知时写 `false`，并在 `unknowns` 中保留问题。

```json
{
  "title": "抖店商品上架验证",
  "facts": {
    "workflow_known": false,
    "inputs_defined": true,
    "outputs_defined": true,
    "volume_known": false,
    "accounts_known": false,
    "acceptance_defined": false,
    "operation_recording": false,
    "requires_login": true,
    "requires_hidden_data": true,
    "automation_sensitive": true,
    "multi_account": true,
    "maintenance_defined": false,
    "official_api_available": false,
    "human_checkpoint_allowed": true,
    "data_sensitive": false,
    "deadline_known": true,
    "budget_known": true,
    "payment_milestone_defined": false
  }
}
```

## 隐私处理

- 姓名改成“客户 A”“中间商 B”。
- 手机号和账号只保留末两位或完全删除。
- 店铺、公司、群名和项目地址使用类型描述替代。
- 链接删除 token、cookie、订单号和查询参数。
- 截图用于公开演示前，遮挡头像、昵称、时间、账号和水印。
