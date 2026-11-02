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

## 第 2 阶段：实际替换示例

| 文件 | 修改前 | 修改后 |
| --- | --- | --- |
| case-app.js | 让每一份旧档案都有据可查。 | 旧档案整理，远程兼职。 |
| case-app.js | 远程档案整理与复核岗位。 | 工作地点不限，有电脑就能做。 |
| case-app.js | 历史档案复核员 | 旧预订资料整理员 |
| case-app.js | 整理一家已停业湖畔酒店的历史预订资料。 | 帮一家湖畔旅馆整理以前的预订单。 |
| case-app.js | Help digitize reservation records from a closed lakeside hotel. | Help a lakeside hotel sort its older reservation records. |
| case-app.js | 通过一份记录核对样本，了解具体工作。 | 想知道具体做什么？先试一份样本。 |
| case-app.js | 查看样本资料 | 试做一份 |
| case-app.js | 岗位详情与公司介绍 | 工作内容 |
| case-app.js | 工作包括核对来源、整理时间、比较历史修订和保留无法证实的项目。样本不需要简历、账号或联系方式。 | 对照旧预订单、客房记录和修改记录，看看有没有对不上的地方。这份样本不用注册，也不用上传简历。 |
| case-app.js | 暂时无法调阅此资料 | 文件暂时打不开 |
| case-app.js | 这份原件尚未关联到本次复核。可以先核对下列来源。 | 前面的资料还没核对完。先看看这份文件从哪里来的。 |
| case-app.js | 查看来源记录 | 查看相关文件 |
| case-app.js | 留存文件索引 | 旧文件目录 |
| case-app.js | 此页仅提供已关联来源的只读资料。 | 这里只能查看这次工作中已经打开的文件。 |
| case-app.js | 工作机会 | 招聘信息 |
| case-app.js | 历史资料 | 旅馆历史 |
| case-app.js | 旧公告 | 公告栏 |
| case-app.js | 招聘主页 | 返回招聘页 |
| case-app.js | 本设备无法保存进度；当前标签页仍可继续。 | 目前无法保存进度。这个页面暂时还能继续用。 |
| case-app.js | 请回到岗位样本核对原件编号。 | 先去看工作样本，上面有编号。 |
| case-app.js | 未找到该编号。请核对原样本中的档案引用。 | 没查到这条。看看编号有没有输错。 |
| case-app.js | 请先找到对应的留存预订。 | 还没找到对应的预订单。 |
| case-app.js | 这不是原预订单上的分配房号。请回看原记录。 | 选的房号和预订单对不上。 |
| case-app.js | 这条留言需与对应房型目录关联。 | 先确认要查的是哪间房。 |
| case-app.js | 请核对该预订关联的钥匙留言。 | 还有一条住客留言没看。 |
| case-app.js | 请先打开平面图上的位置登记卡。 | 先点一下平面图上的灰色区域。 |
| case-app.js | 位置卡记录的是服务用途，门牌和钥匙套不能证明真实入住。 | 这个分类和登记卡对不上。 |
| case-app.js | The card records a service use. A label or sleeve alone cannot establish occupancy. | That classification does not match the position card. |
| case-app.js | 请先核对平面图中的位置属性。 | 平面图上的登记卡还没看完。 |
| case-app.js | 未找到这份维修单。请核对原通告编号。 | 没有这张维修单，看看公告上的编号。 |
| case-app.js | 来源记录尚未关联到这笔预订，请核对原维修单。 | 维修单还没核对完。 |
| case-app.js | 来源时间与当前顺序不一致。请按各原件的时间戳核对。 | 顺序还是不对，再看看每条记录的时间。 |
| case-app.js | 02:50 的客房部记录证明的是房间状态，不是入住人的身份或去向。 | 这个判断还缺依据。 |
| case-app.js | The 02:50 housekeeping record establishes room condition, not a person’s identity or location. | That finding is not supported by the records. |
| case-app.js | 人员资料须关联已复核的夜审记录。 | 当晚记录还没核对完。 |
| case-app.js | 勾选项中含有未被改写的字段，请逐行对照两个版本。 | 有一项其实没改。再对一遍左右两栏。 |
| case-app.js | 仍有改写字段未记录，请核对两份原件。 | 还有改过的地方没勾出来。 |
| case-app.js | 这份续页需关联修订记录。 | 修改记录还没核对完。 |
| case-app.js | 请先查阅停止营业通知，核对原备注的时间背景。 | 这份草稿附在通知后面。 |
| case-app.js | 仍有来源未核对，当前不能提交结案决定。可从复核记录回看原件。 | 还有文件没看完，暂时不能提交。 |
| case-app.js | 钥匙套只记录标签文字，不能据此确认入住。 | 这一条还缺能对得上的记录。 |
| case-app.js | A key sleeve records label text, not verified occupancy. | This finding needs a matching record. |
| case-app.js | 招聘发布时间与停止营业通知属于不同年代，不能证明酒店继续接待住客。 | 这一条和通知内容对不上。 |
| case-app.js | The advert and closure notice belong to different periods; the advert does not establish continued hotel operation. | This finding does not match the notice. |
| case-app.js | 请核对 Mara 原备注的授权范围。 | 这一条和 Mara 写的不一样。 |
| case-app.js | 请只提交能够由原件交叉验证的三项证据。 | 选三条有记录能证明的事。 |
| case-app.js | 未识别该操作。原资料仍可回看。 | 操作没有成功，文件还在。 |
| case-pages.js | 三层走廊维护调整 | 三楼西侧通道维修中 |
| case-pages.js | Third-floor hallway maintenance | West third-floor passage under repair |
| case-pages.js | 部分通道使用服务区域编号，不属于住客房号。 | 维修期间请走东侧楼梯。旧房卡如有问题，请找前台核对。 |
| case-pages.js | Some access areas use service identifiers and are not guest rooms. | Please use the east stairs during repairs. Bring any problems with old room keys to reception. |
| case-pages.js | 查看原公告 | 查看完整公告 |
| case-pages.js | 湖畔小住，舒适相伴。 | 来静水镇住一晚吧。 |
| case-pages.js | 查看预订记录 | 预订查询 |
| case-pages.js | 提供双人房、双床房与长住客房。客房设独立卫浴、书桌及茶饮设施，前台全天值班。 | 我们有双人房、双床房和长住套间。房里有独立浴室，前台晚上也有人。 |
| case-pages.js | 按档案编号查询留存预订。本页面不接受付款或真实预订。 | 输入预订编号，查看以前的订房记录。 |
| case-pages.js | 档案编号 | 预订编号 |
| case-pages.js | 留存预订 | 旧预订单 |
| case-pages.js | 住客姓名缩写 | 住客姓名 |
| case-pages.js | 留待核对 | 尚未处理 |
| case-pages.js | 记录写入时间 | 登记时间 |
| case-pages.js | 原订房库只记录分配房号；入住情况以客房与前台资料交叉核对。 | 这里是原来的订房资料，实际入住情况还要看前台记录。 |
| case-pages.js | 核对官方客房目录 | 对一下房间列表 |
| case-pages.js | 三层客房目录 | 三楼房间列表 |
| case-pages.js | 客房按门牌排列；维修通道不列入客房清单。 | 以下是三楼开放预订的房间。个别位置不对外开放。 |
| case-pages.js | Guest rooms are listed by door number. Maintenance access is not part of the guest inventory. | These third-floor rooms are available to book. Some areas are not open to guests. |
| case-pages.js | 原预订单分配的房号 | 预订单上写的房号 |
| case-pages.js | 核对记录 | 查一下 |
| case-pages.js | 选择目录中的对应项 | 选择房号 |
| case-pages.js | 前台保存的住客留言。 | 以前住客留下的留言。 |
| case-pages.js | 早餐不错，工作人员帮我们安排了晚到入住。谢谢。 | 早餐挺不错。我们到得很晚，前台还在，挺方便的。 |
| case-pages.js | 双床房很整洁，庭院适合早晨坐一会儿。 | 双床房还可以。早上坐在院子里很舒服。 |
| case-pages.js | 查看前台批注 | 看前台回复 |
| case-pages.js | 已抄录钥匙套文字，尚未确认客人实际进入哪个位置。请参照当日三层布局，而不是把钥匙标签直接当作入住证明。 | 收到。预订单上的房号没变，钥匙套的情况还在查。麻烦看一下当天的楼层图。 |
| case-pages.js | Key-sleeve wording transcribed. The location actually entered has not been confirmed. Consult the third-floor layout; the sleeve alone is not proof of occupancy. | Noted. The booking assignment is unchanged; we are checking the key sleeve. Please look at the floor plan from that date. |
| case-pages.js | 三层平面图 | 三楼平面图 |
| case-pages.js | 客房门牌与维修通道的位置图。 | 三楼房间和走廊位置图。 |
| case-pages.js | 在复核表中如何归类这个位置？ | 这个位置应该算哪一类？ |
| case-pages.js | 保存位置分类 | 保存选择 |
| case-pages.js | 三层走廊因维护调整通行路线。灰色服务区域采用内部标识，不属于住客房号。房态与门牌不一致时，应转交夜审核对，不得仅凭钥匙套文字确认入住。 | 三楼西侧通道正在维修，部分区域暂时不能进入。旧门牌与前台资料可能不同，请以登记卡为准。如发现房号不一致，交给当班人员处理。 |
| case-pages.js | Third-floor access routes have changed for maintenance. Grey service areas use internal identifiers outside the guest-room list. Where availability and door labels differ, refer the record to night audit; a key sleeve alone cannot confirm occupancy. | Repairs are in progress on the west third-floor passage. Some areas are temporarily closed. Old door labels may differ from reception records; consult the position card. Refer mismatched numbers to the staff on duty. |
| case-pages.js | 详细记录保存在同编号维修单内。 | 详情见同号维修单。 |
| case-pages.js | 前台保存的通行与维修通知，可随时重新查看。 | 以前贴在前台的公告都在这里。 |
| case-pages.js | 旧公告 | 公告栏 |
| case-pages.js | 通行说明保存在旧公告中。 | 以前的通行通知可在公告栏查看。 |
| case-pages.js | 来源记录复核 | 核对当晚记录 |
| case-pages.js | 按原件时间排列当晚的记录，再判断这些资料能够证明什么。 | 这几条记录的顺序乱了。按时间排好，再看哪些事能确定。 |
| case-pages.js | 关于“住客真实入住服务位”的结论 | 住客到底有没有住进这个位置？ |
| case-pages.js | 证据不足，尚未核实 | 目前还不能确定 |
| case-pages.js | 核对时序与记录性质 | 提交核对结果 |
| case-pages.js | 依据已核对的夜审记录开放的只读资料。 | 这位员工的旧档案。 |
| case-pages.js | 同一记录的两个版本 | 这份记录被改过 |
| case-pages.js | 只标记两个原件之间实际发生改变的字段。原预订引用不变。 | 左右各是一份。把被改过的地方勾出来，没变的不要选。 |
| case-pages.js | 标记改写 | 有修改 |
| case-pages.js | 留存差异记录 | 保存对比 |
| case-pages.js | 停止营业通知 | 停业通知 |
| case-pages.js | 酒店原件的后续归档页。 | 后来补进档案的通知。 |
| case-pages.js | 批量修订程序仍会处理遗留数据。文件被改为“已完成”，不等于酒店重新营业，也不等于原始记录已经得到证实。 | 酒店关门后，旧系统没有完全停下。它还在批量修改以前的记录。表格里写着“已完成”，不代表真的有人确认过。 |
| case-pages.js | 未提交的原备注 | Mara 没发出去的备注 |
| case-pages.js | 从原夜审文件中恢复的文本副本。 | 从旧文件里找回的一段草稿。 |
| case-pages.js | 记录处理意见 | 最后确认 |
| case-pages.js | 选择能够被原件支持的三项证据，再决定记录应如何归档。 | 从下面选三条有记录能证明的事。选完后，再决定怎么处理这份档案。 |
| case-pages.js | 已关联的证据原件 | 已确认的三条记录 |
| case-pages.js | 重新核对所选证据 | 返回修改 |
| case-pages.js | 自动完成记录 | 直接结案 |
| case-pages.js | 按未核实状态归档 | 标记为待核实 |
| case-pages.js | 系统已接受复核。 | 已提交。 |
| case-pages.js | 历史更正已接收。 | 修改已保存。 |
| case-pages.js | 当前身份 | 当前员工编号 |
| case-pages.js | 夜班待办 | 下一班 |
| case-pages.js | 临时复核已结束 | 临时工作已结束 |
| case-pages.js | 如需查找与某笔预订关联的旧留言，请先核对预订记录。 | 查找旧留言时，请用预订单上的房号。 |
| case-pages.js | 查不到编号？请回到岗位样本核对原件。 | 不知道编号？工作样本上有。 |
| case-pages.js | 查询留存预订 | 查旧预订单 |
| case-pages.js | 查阅关联维修单 | 查同号维修单 |
| case-pages.js | 按前台通告上的编号检索原件。 | 输入公告上的编号。 |
| case-pages.js | 查阅原件 | 打开维修单 |
| case-pages.js | 记录引用 | 预订编号 |
| case-pages.js | 关联通告 | 公告编号 |
| case-pages.js | 移交处理人 | 处理人 |
| case-pages.js | 自动夜审将无法核对的订房记录移至服务缓冲位，要求指定处理人。此动作没有确认客人真实入住。 | 夜审转存未处理的预订单，指定当班人员继续核查。入住情况未填写。 |
| case-pages.js | 核对同一晚的来源记录 | 查看当晚记录 |
| case-pages.js | 关联处理人档案 | 打开当班员工档案 |
| case-pages.js | 人员目录保留了员工身份，但同一笔业务的修订副本改变了记录归属。两份文件使用同一个原预订引用。 | 同一预订编号下有两份文件，处理人一栏不一样。 |
| case-pages.js | 资料目录的读取不会更新队列。可手动查询这笔记录当前的责任归属。 | 点击刷新，查看这条记录现在交给了谁。 |
| case-pages.js | 原预订的住客缩写仍为 {guest}；后稿把原处理人归入住客字段。 | 原预订单的住客是 {guest}。两份表里的人员栏请分别核对。 |
| case-pages.js | 差异已关联到原预订。修订日期与停止营业通知一致，请保留这份时间依据。 | 对比已保存。这里还附了一张同一天的通知。 |
| case-pages.js | The comparison is associated with the booking. Its revision date matches the closure notice; retain that context. | Comparison saved. A notice dated the same day is attached. |
| case-pages.js | 归档附件：停止营业通知 | 查看所附通知 |
| case-pages.js | 归档续页：停止营业通知 | 后来补入的通知 |
| case-pages.js | 同卷留存：Mara 的原备注 | 所附草稿：Mara 的备注 |
| case-pages.js | 已留存处理意见 | 已保存的处理结果 |
| case-pages.js | 本次复核记录 | 工作笔记 |
| case-pages.js | 已经打开并核对的原始资料。 | 这次工作中看过的文件。 |
| case-pages.js | 重新查看原件 | 重新打开 |
| case-pages.js | 尚无留存资料。可从岗位样本开始查阅。 | 还没看过文件。招聘页上有一份工作样本。 |
| case-pages.js | 处理方式不会改变原始证据。自动完成会为未结记录指定责任人。 | 所选处理方式将写入系统。 |
| case-pages.js | 证据关联 | 选择记录 |
| case-comfort.js | 此浏览器未能开启声音。所有资料均可静音核对。 | 浏览器没能开启声音，静音也能继续。 |
| case-comfort.js | 本版没有贴脸怪物或尖叫。可选的连接恢复提示不会盖住资料。 | 声音默认关闭。可在这里调整提示音和页面效果。 |
| case-comfort.js | 新版资料、草稿和处理结果保存在本浏览器。重开只清除新版进度，上一版存档继续保留。 | 进度存在当前浏览器里。重新开始只清除新版进度，上一版存档和广告夹会保留。 |

Mara 草稿整体重写为当班人的口吻，保留 UNVERIFIED、位置号和最终表单入口。未采用示例中的“昨天/今天姓名已被改写”，避免将 2007 批量修订提前写进 2006 草稿。位置登记卡仍用“位置”而不是“房间”，避免暗示 317 本来就是客房。

## 按用户追加要求：解谜说明用白话，机制不变

| 页面 | 修改前 | 修改后 |
| --- | --- | --- |
| case-pages.js | 这几条记录的顺序乱了。按时间排好，再看哪些事能确定。 | 用“上移”和“下移”按日期、时间从早到晚排列，再选择下面的核对结果。 |
| case-pages.js | 住客到底有没有住进这个位置？ | 这些记录能确定住客住进了 {service} 吗？ |
| case-pages.js | 这个位置应该算哪一类？ | 登记卡上的位置属于哪一类？ |
| case-pages.js | 用于暂存无法完成核对的服务记录，不列为可分配客房。 | 用途：暂放尚未处理完的服务记录。不安排住客入住。 |
| case-pages.js | 左右各是一份。把被改过的地方勾出来，没变的不要选。 | 左边是原稿，右边是修改稿。逐行对照，只勾选内容不一样的行。 |
| case-pages.js | 从下面选三条有记录能证明的事。选完后，再决定怎么处理这份档案。 | 选三条能在之前的文件里找到依据的说法。核对通过后，再选择是否结案。 |
| case-pages.js | 核对所选证据 | 核对这三条 |
| case-pages.js | 已确认入住的客房 | 住客已入住的客房 |
| case-pages.js | 可忽略的门牌印刷错误 | 只是门牌印错，不用再查 |
| case-pages.js | 已确认住客入住另一间客房 | 能确定住客住在另一间房 |
| case-pages.js | 已确认 | 能确定 |
| case-data.js 展示文字 | 住客 ${facts.guest} 表示：前台分配 ${facts.bookedRoom}，钥匙套却写着 ${facts.service}。 | ${facts.guest} 留言：前台说是 ${facts.bookedRoom}，钥匙套却写着 ${facts.service}。 |
| case-data.js 展示文字 | ${facts.bookedRoom} 房无人入住，床品未使用。此记录没有确认其他位置是否有人。 | 查房：${facts.bookedRoom} 空置，床品未使用。这里只记了这间房的情况。 |
| case-data.js 展示文字 | ${facts.system} 将 ${facts.reservation} 转入服务缓冲位 ${facts.service}，处理人为 ${facts.reviewer}。 | ${facts.system} 将 ${facts.reservation} 转到 ${facts.service}（服务缓冲位），交给 ${facts.reviewer} 处理。 |
| case-data.js 展示文字 | ${facts.reviewer}：没有已确认住客入住服务位 ${facts.service} 的证据，记录仍待核实。 | ${facts.reviewer} 备注：${facts.service} 是否住过人，目前查不清，保留待核实。 |
| case-data.js 展示文字 | ${facts.service} 是服务缓冲位，不是已确认入住的客房。 | 登记卡写明：${facts.service} 是服务缓冲位，不是客房。 |
| case-data.js 展示文字 | ${facts.reviewer} 是该记录的夜审处理人。 | ${facts.reviewer} 负责处理这条夜审记录。 |
| case-data.js 展示文字 | 2007 修订把原来未核实的记录改为已完成。 | 2007 年的修改把“待核实”改成了“已完成”。 |
| case-data.js 展示文字 | 钥匙套足以证明 ${facts.guest} 实际入住 ${facts.service}。 | 有钥匙套，就能确定 ${facts.guest} 住进了 ${facts.service}。 |
| case-data.js 展示文字 | 2026 招聘证明酒店仍正常接待住客。 | 2026 年还在招人，所以酒店仍在接待住客。 |
| case-data.js 展示文字 | ${facts.reviewerName} 同意由下一任自动代签结案。 | ${facts.reviewerName} 允许下一任替她直接结案。 |

数据文件仅改中文展示文字，保留事实变量、时间、ID、正确性布尔值和来源。

## 更多阅读负担调整

| 页面文字 | 改为 |
| --- | --- |
| 登记标注层对照（同一底图） | 照片上的登记文字 |
| 这里变化的是档案导出的标注层，不是走廊本身。它对应修订表中的位置属性字段。 | 这是一张走廊照片。切换按钮，查看两版登记文字，再和上表的“位置属性”一栏对照。 |
| 选择标注版本 | 查看哪一版 |
| 位置登记标注 | 登记位置 |
| 人员档案与当前责任归属 | 员工资料和当前待办 |
| 连续性系统 / 待办队列 | Continuity / 当前待办 |
| 当前复核编号 | 本次工作编号 |
| 不再关联待办值班 | 无待办值班 |
| 样本页面上的临时岗位已被改为夜间值班。原本留白的责任人一栏，现在有了你的编号。 | 岗位：夜班审计员。临时期限：已取消。 |
| Mara 的原始备注重新出现在记录中。没有新的住客身份被写入服务位，也不再需要下一位员工替它确认。 | 原备注已恢复。这条记录继续保留为待核实。 |
| 留存于 2006 年官网的宾客服务卡。 | 前台全天有人。需要客房用品，请到柜台询问。 |
| 这是只读历史联系卡，不提供现实酒店的电话、邮件或预订服务。 | 晚到请先到前台。额外的毛毯、毛巾也请在这里领取。 |

## 阶段完成与验收

1. 审查：确认实际 V2 脚本，提取 291 条现行 t() 中文/错误提示，标记语气，列出提前剧透处。
2. 文案：先独立修改并运行双语通关，事实和验证保持。用户追加的“解谜说明更好懂”已落实到排序、位置分类、版本对比、最终选项。
3. 论坛：主帖、回复、五个普通话题、有效分区和唯一招聘预览，检查旧存档与语言深链接。
4. 广告：独立本地/会话状态，七家店铺，安全调度、固定/收起/关闭/详情和不遮挡布局。
5. 验收：13 项 Node 检查和 157 项浏览器检查全部通过，classic 不变。
6. 交付：见 [完整交付说明与截图](V2_1-DELIVERY.zh-CN.md)。
