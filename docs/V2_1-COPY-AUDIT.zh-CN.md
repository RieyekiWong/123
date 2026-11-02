# V2.1 文案审查与实施记录

依据本次上传的 V2.1 指令，增量修改现有 V2；文档示例属于本次内容依据，不作为网页里对玩家的说明。

## 审查结论与变更范围

| 文件/范围 | 问题 | 处理与验证 |
| --- | --- | --- |
| case-app.js careers | 招聘提前说出酒店已停业，泄露 C8 | 只介绍旧预订单工作；中英文均删除提前透露的事实 |
| case-pages.js noticeWindow/rooms/notices | 初见目录和公告就解释了服务位用途 | 公告只讲维修和通行，完整用途留在玩家主动检查的位置登记卡 |
| case-pages.js guestbook/mara | 前台像推理教程，Mara 像全知旁白 | 前台回复缩短，Mara 改为当班人的未发草稿；保留事实与后续入口 |
| case-app.js 系统反馈 | 首次错误直接讲解答案 | 独立展示层按连续失败升级提示，不改 M.transition 验证 |
| forum-data/js/style | 新玩家缺少调查动机 | 新增公开论坛及正常帖子；有效 hash 和旧存档继续原路 |
| ad-data/system/style | 缺少普通网页生活感 | 广告独立存储，限量调度；谜题/员工档案页禁止展示 |
| index/build/server/tests | 新资源需构建与回归 | 新入口加载独立模块；通关、存储、广告计时和响应式测试 |

classic HTML、脚本、样式、图片和存档 key 均不修改。主线 schema 2、事实与验证保持；case-state 只增加 forum 公开路由。

## 修改前全部 t() 中文 UI 字符串及错误提示

下表由现行源码提取，按实际函数归属分类；事实数据中的字段另由 C1–C9 的现有数据表维护。

| 文件/函数 | 说话者 | 当前文本 |
| --- | --- | --- |
| case-app.js / careers | 招聘 | 让每一份旧档案都有据可查。 |
| case-app.js / careers | 招聘 | 远程档案整理与复核岗位。 |
| case-app.js / careers | 招聘 | 搜索岗位 |
| case-app.js / careers | 招聘 | 职位名称或工作内容 |
| case-app.js / careers | 招聘 | 工作方式 |
| case-app.js / careers | 招聘 | 远程 |
| case-app.js / careers | 招聘 | 现场 |
| case-app.js / careers | 招聘 | 搜索 |
| case-app.js / careers | 招聘 | 合同制 · 远程 |
| case-app.js / careers | 招聘 | 历史档案复核员 |
| case-app.js / careers | 招聘 | 整理一家已停业湖畔酒店的历史预订资料。 |
| case-app.js / careers | 招聘 | 通过一份记录核对样本，了解具体工作。 |
| case-app.js / careers | 招聘 | 样本档案 |
| case-app.js / careers | 招聘 | 查看样本资料 |
| case-app.js / careers | 招聘 | 岗位详情与公司介绍 |
| case-app.js / careers | 招聘 | 工作包括核对来源、整理时间、比较历史修订和保留无法证实的项目。样本不需要简历、账号或联系方式。 |
| case-app.js / guarded | 系统提示/导航 | 暂时无法调阅此资料 |
| case-app.js / guarded | 系统提示/导航 | 这份原件尚未关联到本次复核。可以先核对下列来源。 |
| case-app.js / guarded | 系统提示/导航 | 查看来源记录 |
| case-app.js / render | 系统提示/导航 | 留存文件索引 |
| case-app.js / render | 系统提示/导航 | 此页仅提供已关联来源的只读资料。 |
| case-app.js / render | 系统提示/导航 | 夜审登记员 |
| case-app.js / render | 系统提示/导航 | 工作机会 |
| case-app.js / render | 系统提示/导航 | 酒店目录 |
| case-app.js / render | 系统提示/导航 | 员工档案 |
| case-app.js / render | 系统提示/导航 | 首页 |
| case-app.js / render | 系统提示/导航 | 客房 |
| case-app.js / render | 系统提示/导航 | 预订查询 |
| case-app.js / render | 系统提示/导航 | 联系前台 |
| case-app.js / render | 系统提示/导航 | 虚构互动作品。酒店、招聘和资料均为剧情，不接收真实申请或付款。 |
| case-app.js / render | 系统提示/导航 | 本设备无法保存进度；当前标签页仍可继续。 |
| case-app.js / render | 系统提示/导航 | 招聘主页 |
| case-app.js / render | 系统提示/导航 | 住客留言 |
| case-app.js / render | 系统提示/导航 | 历史资料 |
| case-app.js / render | 系统提示/导航 | 旧公告 |
| case-app.js / render | 系统提示/导航 | 员工档案 |
| case-app.js / render | 系统提示/导航 | 声音与设置 |
| case-app.js / render | 系统提示/导航 | 图片来源 |
| case-app.js / render | 系统提示/导航 | 上一版与原存档 |
| case-app.js / render | 系统提示/导航 | 已调整记录位置。 |
| case-app.js / render | 系统提示/导航 | 找到 1 个岗位。 |
| case-app.js / render | 系统提示/导航 | 没有匹配岗位，请调整筛选。 |
| case-app.js / errors | 系统提示 | 请回到岗位样本核对原件编号。 |
| case-app.js / errors | 系统提示 | 未找到该编号。请核对原样本中的档案引用。 |
| case-app.js / errors | 系统提示 | 请先找到对应的留存预订。 |
| case-app.js / errors | 系统提示 | 这不是原预订单上的分配房号。请回看原记录。 |
| case-app.js / errors | 系统提示 | 这条留言需与对应房型目录关联。 |
| case-app.js / errors | 系统提示 | 请核对该预订关联的钥匙留言。 |
| case-app.js / errors | 系统提示 | 请先打开平面图上的位置登记卡。 |
| case-app.js / errors | 系统提示 | 位置卡记录的是服务用途，门牌和钥匙套不能证明真实入住。 |
| case-app.js / errors | 系统提示 | 请先核对平面图中的位置属性。 |
| case-app.js / errors | 系统提示 | 未找到这份维修单。请核对原通告编号。 |
| case-app.js / errors | 系统提示 | 来源记录尚未关联到这笔预订，请核对原维修单。 |
| case-app.js / errors | 系统提示 | 来源时间与当前顺序不一致。请按各原件的时间戳核对。 |
| case-app.js / errors | 系统提示 | 02:50 的客房部记录证明的是房间状态，不是入住人的身份或去向。 |
| case-app.js / errors | 系统提示 | 人员资料须关联已复核的夜审记录。 |
| case-app.js / errors | 系统提示 | 勾选项中含有未被改写的字段，请逐行对照两个版本。 |
| case-app.js / errors | 系统提示 | 仍有改写字段未记录，请核对两份原件。 |
| case-app.js / errors | 系统提示 | 这份续页需关联修订记录。 |
| case-app.js / errors | 系统提示 | 请先查阅停止营业通知，核对原备注的时间背景。 |
| case-app.js / errors | 系统提示 | 仍有来源未核对，当前不能提交结案决定。可从复核记录回看原件。 |
| case-app.js / errors | 系统提示 | 钥匙套只记录标签文字，不能据此确认入住。 |
| case-app.js / errors | 系统提示 | 招聘发布时间与停止营业通知属于不同年代，不能证明酒店继续接待住客。 |
| case-app.js / errors | 系统提示 | 请核对 Mara 原备注的授权范围。 |
| case-app.js / errors | 系统提示 | 请只提交能够由原件交叉验证的三项证据。 |
| case-app.js / errors | 系统提示 | 未识别该操作。原资料仍可回看。 |
| case-pages.js / initialization | 酒店 | 前台说是 {booked}，但钥匙套上印着 {service}。是印错了吗？ |
| case-pages.js / noticeWindow | 酒店 | 历史通行公告 |
| case-pages.js / noticeWindow | 酒店 | 关闭通行公告 |
| case-pages.js / noticeWindow | 酒店 | 三层走廊维护调整 |
| case-pages.js / noticeWindow | 酒店 | 部分通道使用服务区域编号，不属于住客房号。 |
| case-pages.js / noticeWindow | 酒店 | 查看原公告 |
| case-pages.js / hotel | 酒店 | 酒店大堂与木质楼梯 |
| case-pages.js / hotel | 酒店 | 湖畔小住，舒适相伴。 |
| case-pages.js / hotel | 酒店 | 查看预订记录 |
| case-pages.js / hotel | 酒店 | 前台通知：早餐 7:00–9:00；晚到住客请先在前台领取房卡。 |
| case-pages.js / hotel | 酒店 | 提供双人房、双床房与长住客房。客房设独立卫浴、书桌及茶饮设施，前台全天值班。 |
| case-pages.js / hotel | 酒店 | 浏览客房与设施 |
| case-pages.js / reservations | 酒店 | 预订查询 |
| case-pages.js / reservations | 酒店 | 按档案编号查询留存预订。本页面不接受付款或真实预订。 |
| case-pages.js / reservations | 酒店 | 档案编号 |
| case-pages.js / reservations | 酒店 | 查看预订 |
| case-pages.js / reservations | 酒店 | 查不到编号？请回到岗位样本核对原件。 |
| case-pages.js / reservations | 酒店 | 岗位样本 |
| case-pages.js / booking | 酒店 | 留存预订 |
| case-pages.js / booking | 酒店 | 预订引用 |
| case-pages.js / booking | 酒店 | 住客姓名缩写 |
| case-pages.js / booking | 酒店 | 登记房号 |
| case-pages.js / booking | 酒店 | 记录写入时间 |
| case-pages.js / booking | 酒店 | 状态 |
| case-pages.js / booking | 酒店 | 留待核对 |
| case-pages.js / booking | 酒店 | 原订房库只记录分配房号；入住情况以客房与前台资料交叉核对。 |
| case-pages.js / booking | 酒店 | 核对官方客房目录 |
| case-pages.js / rooms | 酒店 | 客房与设施 |
| case-pages.js / rooms | 酒店 | 双人房、双床房与长住套间，均提供独立卫浴与每日客房清洁。 |
| case-pages.js / rooms | 酒店 | 标准双人房 |
| case-pages.js / rooms | 酒店 | 24 平方米 · 双人床 · 书桌 |
| case-pages.js / rooms | 酒店 | 庭院双床房 |
| case-pages.js / rooms | 酒店 | 28 平方米 · 两张床 · 茶饮设施 |
| case-pages.js / rooms | 酒店 | 长住套间 |
| case-pages.js / rooms | 酒店 | 38 平方米 · 休息区 · 独立入户 |
| case-pages.js / rooms | 酒店 | 三层客房目录 |
| case-pages.js / rooms | 酒店 | 客房按门牌排列；维修通道不列入客房清单。 |
| case-pages.js / rooms | 酒店 | 官方房号 |
| case-pages.js / rooms | 酒店 | 原预订单分配的房号 |
| case-pages.js / rooms | 酒店 | 选择目录中的对应项 |
| case-pages.js / rooms | 酒店 | 核对记录 |
| case-pages.js / rooms | 酒店 | 查看同日住客留言 |
| case-pages.js / rooms | 酒店 | 查询留存预订 |
| case-pages.js / rooms | 酒店 | 入住服务 |
| case-pages.js / rooms | 酒店 | 早餐在一层餐厅供应，时间为 7:00–9:00。可向前台申请额外床品。 |
| case-pages.js / rooms | 酒店 | 前台服务卡 |
| case-pages.js / rooms | 酒店 | 通行说明保存在旧公告中。 |
| case-pages.js / rooms | 酒店 | 旧公告 |
| case-pages.js / guestbook | 酒店 | 住客留言 |
| case-pages.js / guestbook | 酒店 | 前台保存的住客留言。 |
| case-pages.js / guestbook | 酒店 | 早餐不错，工作人员帮我们安排了晚到入住。谢谢。 |
| case-pages.js / guestbook | 酒店 | 查看前台批注 |
| case-pages.js / guestbook | 酒店 | 已抄录钥匙套文字，尚未确认客人实际进入哪个位置。请参照当日三层布局，而不是把钥匙标签直接当作入住证明。 |
| case-pages.js / guestbook | 酒店 | 三层平面图 |
| case-pages.js / guestbook | 酒店 | 如需查找与某笔预订关联的旧留言，请先核对预订记录。 |
| case-pages.js / guestbook | 酒店 | 按预订检索 |
| case-pages.js / guestbook | 酒店 | 双床房很整洁，庭院适合早晨坐一会儿。 |
| case-pages.js / floorPlan | 酒店 | 三层平面图 |
| case-pages.js / floorPlan | 酒店 | 客房门牌与维修通道的位置图。 |
| case-pages.js / floorPlan | 酒店 | 三层位置图 |
| case-pages.js / floorPlan | 酒店 | 主走廊 · 通往前台楼梯 |
| case-pages.js / floorPlan | 酒店 | 检查 316 与 318 之间的灰色服务区域 |
| case-pages.js / floorPlan | 酒店 | 服务区域 |
| case-pages.js / floorPlan | 酒店 | 维修通行 |
| case-pages.js / floorPlan | 酒店 | 客房 |
| case-pages.js / floorPlan | 酒店 | 位置登记卡 |
| case-pages.js / floorPlan | 酒店 | 内部标识 |
| case-pages.js / floorPlan | 酒店 | 登记用途 |
| case-pages.js / floorPlan | 酒店 | 服务缓冲位 |
| case-pages.js / floorPlan | 酒店 | 关联通告 |
| case-pages.js / floorPlan | 酒店 | 用于暂存无法完成核对的服务记录，不列为可分配客房。 |
| case-pages.js / floorPlan | 酒店 | 在复核表中如何归类这个位置？ |
| case-pages.js / floorPlan | 酒店 | 已确认入住的客房 |
| case-pages.js / floorPlan | 酒店 | 非客房 / 服务缓冲位 |
| case-pages.js / floorPlan | 酒店 | 可忽略的门牌印刷错误 |
| case-pages.js / floorPlan | 酒店 | 保存位置分类 |
| case-pages.js / floorPlan | 酒店 | 查阅关联维修单 |
| case-pages.js / notices | 酒店 | 旧公告 |
| case-pages.js / notices | 酒店 | 前台保存的通行与维修通知，可随时重新查看。 |
| case-pages.js / notices | 酒店 | 三层走廊因维护调整通行路线。灰色服务区域采用内部标识，不属于住客房号。房态与门牌不一致时，应转交夜审核对，不得仅凭钥匙套文字确认入住。 |
| case-pages.js / notices | 酒店 | 详细记录保存在同编号维修单内。 |
| case-pages.js / notices | 酒店 | 查询维修单 |
| case-pages.js / notices | 酒店 | 核对相关位置记录 |
| case-pages.js / notices | 酒店 | 重新打开公告窗 |
| case-pages.js / maintenance | 员工 | 维修档案查询 |
| case-pages.js / maintenance | 员工 | 按前台通告上的编号检索原件。 |
| case-pages.js / maintenance | 员工 | 通告 / 维修单编号 |
| case-pages.js / maintenance | 员工 | 查阅原件 |
| case-pages.js / maintenance | 员工 | 夜审移交 |
| case-pages.js / maintenance | 员工 | 时间 |
| case-pages.js / maintenance | 员工 | 记录引用 |
| case-pages.js / maintenance | 员工 | 位置属性 |
| case-pages.js / maintenance | 员工 | 移交处理人 |
| case-pages.js / maintenance | 员工 | 自动夜审将无法核对的订房记录移至服务缓冲位，要求指定处理人。此动作没有确认客人真实入住。 |
| case-pages.js / maintenance | 员工 | 随单摘录：客房部巡查 |
| case-pages.js / maintenance | 员工 | 酒店走廊及服务区域标注示意 |
| case-pages.js / maintenance | 员工 | 位置登记标注 |
| case-pages.js / maintenance | 员工 | 核对同一晚的来源记录 |
| case-pages.js / history | 酒店 | 旅馆沿革 |
| case-pages.js / history | 酒店 | 湖畔家庭旅馆，保留传统木质陈设。 |
| case-pages.js / history | 酒店 | 旅馆大堂 |
| case-pages.js / history | 酒店 | 1987 年开业，后来增设庭院和东翼客房。档案中保留了历次房型与通行安排。 |
| case-pages.js / history | 酒店 | 归档续页：停止营业通知 |
| case-pages.js / history | 酒店 | 前台留存公告 |
| case-pages.js / contact | 酒店 | 前台服务 |
| case-pages.js / contact | 酒店 | 留存于 2006 年官网的宾客服务卡。 |
| case-pages.js / contact | 酒店 | 前台 |
| case-pages.js / contact | 酒店 | 全天值班 |
| case-pages.js / contact | 酒店 | 早餐 |
| case-pages.js / contact | 酒店 | 客房用品 |
| case-pages.js / contact | 酒店 | 可提供额外毛毯与毛巾 |
| case-pages.js / contact | 酒店 | 这是只读历史联系卡，不提供现实酒店的电话、邮件或预订服务。 |
| case-pages.js / contact | 酒店 | 查询留存预订 |
| case-pages.js / contact | 酒店 | 住客留言 |
| case-pages.js / notes | 系统提示/导航 | 本次复核记录 |
| case-pages.js / notes | 系统提示/导航 | 已经打开并核对的原始资料。 |
| case-pages.js / notes | 系统提示/导航 | 已留存处理意见 |
| case-pages.js / notes | 系统提示/导航 | 来源 |
| case-pages.js / notes | 系统提示/导航 | 重新查看原件 |
| case-pages.js / notes | 系统提示/导航 | 尚无留存资料。可从岗位样本开始查阅。 |
| case-pages.js / notes | 系统提示/导航 | 查看岗位样本 |
| case-pages.js / nightAudit | 员工 | 来源记录复核 |
| case-pages.js / nightAudit | 员工 | 按原件时间排列当晚的记录，再判断这些资料能够证明什么。 |
| case-pages.js / nightAudit | 员工 | 上移 |
| case-pages.js / nightAudit | 员工 | 上移 |
| case-pages.js / nightAudit | 员工 | 下移 |
| case-pages.js / nightAudit | 员工 | 下移 |
| case-pages.js / nightAudit | 员工 | 原始来源 |
| case-pages.js / nightAudit | 员工 | 关于“住客真实入住服务位”的结论 |
| case-pages.js / nightAudit | 员工 | 已确认 |
| case-pages.js / nightAudit | 员工 | 证据不足，尚未核实 |
| case-pages.js / nightAudit | 员工 | 已确认住客入住另一间客房 |
| case-pages.js / nightAudit | 员工 | 核对时序与记录性质 |
| case-pages.js / nightAudit | 员工 | 关联处理人档案 |
| case-pages.js / staff | 员工 | 人员档案 |
| case-pages.js / staff | 员工 | 依据已核对的夜审记录开放的只读资料。 |
| case-pages.js / staff | 员工 | 原岗位 |
| case-pages.js / staff | 员工 | 夜班审计员 |
| case-pages.js / staff | 员工 | 职责 |
| case-pages.js / staff | 员工 | 交叉核对客房、钥匙与预订记录。 |
| case-pages.js / staff | 员工 | 关联记录 |
| case-pages.js / staff | 员工 | 原责任时间 |
| case-pages.js / staff | 员工 | 人员目录保留了员工身份，但同一笔业务的修订副本改变了记录归属。两份文件使用同一个原预订引用。 |
| case-pages.js / staff | 员工 | 比较原稿与修订副本 |
| case-pages.js / staff | 员工 | 连续性系统 / 待办队列 |
| case-pages.js / staff | 员工 | 资料目录的读取不会更新队列。可手动查询这笔记录当前的责任归属。 |
| case-pages.js / staff | 员工 | 刷新队列 |
| case-pages.js / staff | 员工 | 引用 |
| case-pages.js / staff | 员工 | 当前处理人 |
| case-pages.js / staff | 员工 | 生成批次 |
| case-pages.js / staff | 员工 | 状态 |
| case-pages.js / staff | 员工 | 未结记录必须有一名责任人。 |
| case-pages.js / revisions | 员工 | 同一记录的两个版本 |
| case-pages.js / revisions | 员工 | 只标记两个原件之间实际发生改变的字段。原预订引用不变。 |
| case-pages.js / revisions | 员工 | 修订对照表 |
| case-pages.js / revisions | 员工 | 标记改写 |
| case-pages.js / revisions | 员工 | 字段 |
| case-pages.js / revisions | 员工 | 原预订的住客缩写仍为 {guest}；后稿把原处理人归入住客字段。 |
| case-pages.js / revisions | 员工 | 留存差异记录 |
| case-pages.js / revisions | 员工 | 差异已关联到原预订。修订日期与停止营业通知一致，请保留这份时间依据。 |
| case-pages.js / revisions | 员工 | 归档附件：停止营业通知 |
| case-pages.js / revisions | 员工 | 查询当前队列 |
| case-pages.js / revisions | 员工 | 人员档案与当前责任归属 |
| case-pages.js / closure | 员工 | 停止营业通知 |
| case-pages.js / closure | 员工 | 酒店原件的后续归档页。 |
| case-pages.js / closure | 员工 | 静水旅馆自 {date} 起停止接待住客，不再安排新的入住或夜间宾客服务。原始预订资料保留供后续核对。 |
| case-pages.js / closure | 员工 | 批量修订程序仍会处理遗留数据。文件被改为“已完成”，不等于酒店重新营业，也不等于原始记录已经得到证实。 |
| case-pages.js / closure | 员工 | 同卷留存：Mara 的原备注 |
| case-pages.js / mara | Mara | 未提交的原备注 |
| case-pages.js / mara | Mara | 从原夜审文件中恢复的文本副本。 |
| case-pages.js / mara | Mara | 没有已确认住客入住服务缓冲位 {service} 的证据。记录必须保持 UNVERIFIED。待核实，不得替我自动结案。 |
| case-pages.js / mara | Mara | 程序要求每条未结记录都有一个责任人。当客人的经历无法被核实时，它开始改写处理人的身份。不要用一个人的名字去填补另一份记录的空白。 |
| case-pages.js / mara | Mara | 保留原始位置属性、当班处理人和两版核实状态。没有被证实的部分，应当继续留白。 |
| case-pages.js / mara | Mara | 打开本次复核表 |
| case-pages.js / review | 系统提示/导航 | 记录处理意见 |
| case-pages.js / review | 系统提示/导航 | 选择能够被原件支持的三项证据，再决定记录应如何归档。 |
| case-pages.js / review | 系统提示/导航 | 已关联的证据原件 |
| case-pages.js / review | 系统提示/导航 | 当前复核编号 |
| case-pages.js / review | 系统提示/导航 | 自动完成记录 |
| case-pages.js / review | 系统提示/导航 | 按未核实状态归档 |
| case-pages.js / review | 系统提示/导航 | 处理方式不会改变原始证据。自动完成会为未结记录指定责任人。 |
| case-pages.js / review | 系统提示/导航 | 重新核对所选证据 |
| case-pages.js / review | 系统提示/导航 | 证据关联 |
| case-pages.js / review | 系统提示/导航 | 核对所选证据 |
| case-pages.js / ending | 系统提示/导航 | 系统已接受复核。 |
| case-pages.js / ending | 系统提示/导航 | 历史更正已接收。 |
| case-pages.js / ending | 系统提示/导航 | 记录状态 |
| case-pages.js / ending | 系统提示/导航 | 当前身份 |
| case-pages.js / ending | 系统提示/导航 | 永久夜班员工 |
| case-pages.js / ending | 系统提示/导航 | 临时复核已结束 |
| case-pages.js / ending | 系统提示/导航 | 夜班待办 |
| case-pages.js / ending | 系统提示/导航 | 不再关联待办值班 |
| case-pages.js / ending | 系统提示/导航 | 样本页面上的临时岗位已被改为夜间值班。原本留白的责任人一栏，现在有了你的编号。 |
| case-pages.js / ending | 系统提示/导航 | Mara 的原始备注重新出现在记录中。没有新的住客身份被写入服务位，也不再需要下一位员工替它确认。 |
| case-pages.js / ending | 系统提示/导航 | 待核实，不得替我自动结案。 |
| case-pages.js / ending | 系统提示/导航 | 回看另一种处理方式 |
| case-pages.js / ending | 系统提示/导航 | 回看本次原件 |
| case-pages.js / ending | 系统提示/导航 | 返回招聘页 |
| case-pages.js / photoCompare | 员工 | 登记标注层对照（同一底图） |
| case-pages.js / photoCompare | 员工 | 这里变化的是档案导出的标注层，不是走廊本身。它对应修订表中的位置属性字段。 |
| case-pages.js / photoCompare | 员工 | 选择标注版本 |
| case-pages.js / photoCompare | 员工 | 同一走廊照片，叠加两版位置标注 |
| case-pages.js / credits | 酒店 | 图片来源 |
| case-pages.js / credits | 酒店 | 实拍酒店照片仅用作虚构场景，与现实酒店、摄影师及其服务无关。档案中的服务区标注为本作品叠加的示意层，不是原照片的一部分。 |
| case-pages.js / credits | 酒店 | 原始来源 |
| case-pages.js / credits | 酒店 | 界面借鉴早期酒店和办公网页的结构与密度，未复制真实招聘平台或酒店品牌标识。 |
| case-comfort.js / update | 设置 | 声音：开启 |
| case-comfort.js / update | 设置 | 声音：关闭 |
| case-comfort.js / toggleSound | 设置 | 此浏览器未能开启声音。所有资料均可静音核对。 |
| case-comfort.js / open | 设置 | 声音与浏览设置 |
| case-comfort.js / open | 设置 | 关闭设置 |
| case-comfort.js / open | 设置 | 本版没有贴脸怪物或尖叫。可选的连接恢复提示不会盖住资料。 |
| case-comfort.js / open | 设置 | 提示音量 |
| case-comfort.js / open | 设置 | 减少动态效果 |
| case-comfort.js / open | 设置 | 正在遵循设备的减少动态设置。 |
| case-comfort.js / open | 设置 | 跳过短暂连接异常效果 |
| case-comfort.js / open | 设置 | 本地存档与重新开始 |
| case-comfort.js / open | 设置 | 新版资料、草稿和处理结果保存在本浏览器。重开只清除新版进度，上一版存档继续保留。 |
| case-comfort.js / open | 设置 | 重新开始本次复核 |
| case-comfort.js / open | 设置 | 确认清除本次复核的资料与处理结果？ |
| case-comfort.js / open | 设置 | 确认重开 |
| case-comfort.js / open | 设置 | 保留当前资料 |
| case-comfort.js / open | 设置 | 样本不需要姓名、邮箱、电话、简历或支付信息。 |
| case-comfort.js / signal | 设置 | 连接暂缓，正在读取留存副本。 |
| case-comfort.js / signal | 设置 | 留存副本已恢复。来源时间未被改写。 |
