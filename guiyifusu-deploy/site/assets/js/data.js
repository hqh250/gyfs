/* 种子数据 + 站点文案 */
(function () {
  const AVATARS = [
    ["#7c1a22", "#2a0609"],
    ["#8a2c14", "#2c0d06"],
    ["#5e1e6b", "#1e0824"],
    ["#1f4d5e", "#07161c"],
    ["#6b4a12", "#221604"],
    ["#4a1f1f", "#170707"],
    ["#2f3d6b", "#0b0f1e"],
    ["#14524a", "#041714"],
    ["#6b2b3e", "#200a12"],
    ["#3d3d3d", "#111"],
    ["#7a3a10", "#241004"],
    ["#334d2a", "#0d150a"],
  ];

  const CATEGORIES = [
    { id: "general", name: "综合讨论", desc: "基地大厅，随便聊" },
    { id: "lore", name: "灵异档案", desc: "规矩、事件与怪谈" },
    { id: "guide", name: "攻略心得", desc: "怎么活下来" },
    { id: "team", name: "招募组队", desc: "找人一起接任务" },
    { id: "feedback", name: "反馈建议", desc: "对基地的意见" },
  ];

  const POSITIONS = [
    { id: "leader", name: "会长" },
    { id: "vice", name: "副会长" },
    { id: "elite", name: "精英" },
    { id: "member", name: "成员" },
  ];

  const now = Date.now();
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;

  const users = [
    {
      id: 1,
      username: "shenye",
      password: "seed",
      nickname: "沈夜",
      avatar: 0,
      qq: "100200301",
      bio: "守夜人会长。右眼在第三次任务里留在了那栋楼。",
      role: "user",
      seed: true,
      createdAt: now - 62 * day,
      lastSeen: now - 20 * min,
    },
    {
      id: 2,
      username: "baiya",
      password: "seed",
      nickname: "白鸦",
      avatar: 2,
      qq: "100200302",
      bio: "记录比记忆可靠。档案室常驻。",
      role: "user",
      seed: true,
      createdAt: now - 55 * day,
      lastSeen: now - 3 * hour,
    },
    {
      id: 3,
      username: "chenmo",
      password: "seed",
      nickname: "陈默",
      avatar: 1,
      qq: "100200303",
      bio: "红月信徒。别在红月下抬头。",
      role: "user",
      seed: true,
      createdAt: now - 48 * day,
      lastSeen: now - 5 * hour,
    },
    {
      id: 4,
      username: "linxiaoman",
      password: "seed",
      nickname: "林小满",
      avatar: 4,
      qq: "100200304",
      bio: "新人，正在攒第一个封印位。",
      role: "user",
      seed: true,
      createdAt: now - 12 * day,
      lastSeen: now - 40 * min,
    },
    {
      id: 5,
      username: "guqing",
      password: "seed",
      nickname: "顾青",
      avatar: 5,
      qq: "",
      bio: "还没绑定 QQ，只能看帖。",
      role: "user",
      seed: true,
      createdAt: now - 9 * day,
      lastSeen: now - 2 * day,
    },
    {
      id: 6,
      username: "aqi",
      password: "seed",
      nickname: "阿七",
      avatar: 7,
      qq: "100200306",
      bio: "第三扇门的门童。",
      role: "user",
      seed: true,
      createdAt: now - 30 * day,
      lastSeen: now - 26 * hour,
    },
  ];

  const posts = [
    {
      id: 101,
      cat: "lore",
      title: "编号 001「敲门」的完整规矩，有人补全过吗？",
      body:
        "档案里只写了三条：不要应、不要问、不要开。\n\n但我在旧楼里遇到的版本多了一条——\n如果门缝下开始渗进纸，那不是人皮纸，是它在模仿。\n\n有人见过第四条吗？",
      author: 1,
      at: now - 2 * hour,
      likes: [2, 3, 4],
      views: 342,
      pinned: true,
      locked: false,
    },
    {
      id: 102,
      cat: "guide",
      title: "新人第一次接 C 级任务，需要准备什么？",
      body:
        "刚过完基地考核，准备接第一个 C 级。\n\n看攻略说至少带一枚封灵符、一部卫星手机，还要提前把规矩抄在纸上。\n有没有前辈愿意补充一下，哪些东西是必须带的？",
      author: 4,
      at: now - 5 * hour,
      likes: [2, 6],
      views: 210,
      pinned: false,
      locked: false,
    },
    {
      id: 103,
      cat: "general",
      title: "基地新大厅的证件系统挺好用，但门禁卡丢了能补吗",
      body: "早上刷卡进档案室，卡掉在电梯缝里了。\n问一下补办流程，别让我被巡逻的当成越级。",
      author: 5,
      at: now - 9 * hour,
      likes: [4],
      views: 96,
      pinned: false,
      locked: false,
    },
    {
      id: 104,
      cat: "team",
      title: "【招募】红月夜四人队，缺一个封印位",
      body:
        "10 月 31 日 20:00，红月事件。\n现有三人：两个输出、一个感知。缺一个封印位。\n要求：至少封印过一只 B 级，听指挥，不抢最后一刀。\n\n有意在下面留 ID，我会私信。",
      author: 3,
      at: now - 14 * hour,
      likes: [4, 6],
      views: 288,
      pinned: false,
      locked: false,
    },
    {
      id: 105,
      cat: "lore",
      title: "人皮纸的代价，到底是怎么扣的？",
      body:
        "有人说扣阳寿，有人说扣记忆。\n我更好奇的是：它怎么决定扣哪一样。\n\n上次问它「我妹妹叫什么」，它没有回答。\n第二天我发现，我确实想不起来了。",
      author: 2,
      at: now - 20 * hour,
      likes: [1, 3, 4, 6],
      views: 617,
      pinned: false,
      locked: false,
    },
    {
      id: 106,
      cat: "feedback",
      title: "建议：把「厉鬼反噬」的提示做得更明显一点",
      body:
        "现在反噬前只有屏幕边缘微微发红，新手很容易忽略。\n建议加一次心跳音效，或者在状态栏闪一下。\n毕竟反噬一次，任务就废了。",
      author: 6,
      at: now - 26 * hour,
      likes: [2],
      views: 74,
      pinned: false,
      locked: false,
    },
    {
      id: 107,
      cat: "general",
      title: "你们第一次看见「规矩」的时候，是什么感觉",
      body: "我看见它的时候，它也在看我。\n那之后我就知道，这东西不是用来打的。",
      author: 1,
      at: now - 2 * day,
      likes: [2, 3, 4, 5],
      views: 401,
      pinned: false,
      locked: false,
    },
    {
      id: 108,
      cat: "guide",
      title: "整理了一份「新手第一周」清单，欢迎补充",
      body:
        "1. 先把基地地图走一遍，记住安全屋位置；\n2. 第一只鬼不要急着封印，先观察它杀人的条件；\n3. 每天看一次公告，红月期间不要单独出任务；\n4. 把紧急联系人写成工号，不要写名字。\n\n欢迎在下面补。",
      author: 2,
      at: now - 3 * day,
      likes: [1, 4, 5, 6],
      views: 528,
      pinned: false,
      locked: false,
    },
  ];

  const replies = [
    { id: 201, post: 101, author: 2, at: now - 100 * min, body: "第四条：不要看猫眼超过三秒。\n我补在档案背面了。" },
    { id: 202, post: 101, author: 4, at: now - 90 * min, body: "看完这条我决定今晚不回家了。" },
    { id: 203, post: 102, author: 1, at: now - 4 * hour, body: "封灵符带两枚，一枚是给别人用的。\n还有，把「不要回头」写在手背上。" },
    { id: 204, post: 102, author: 2, at: now - 3 * hour, body: "补充：卫星手机充满电，备用电池比符重要。" },
    { id: 205, post: 104, author: 6, at: now - 12 * hour, body: "ID：aqi。封印过一只 B，听指挥。\n不过我这边有个条件：不接红月之后的善后。" },
    { id: 206, post: 105, author: 1, at: now - 18 * hour, body: "它不回答，是因为答案已经被取走了。" },
    { id: 207, post: 105, author: 3, at: now - 16 * hour, body: "所以别问自己承受不起的问题。" },
    { id: 208, post: 108, author: 4, at: now - 2 * day, body: "补充：第一次出任务前，把遗言写好。不是开玩笑。" },
    { id: 209, post: 107, author: 5, at: now - 30 * hour, body: "像被人从背后叫了名字。" },
  ];

  const guilds = [
    {
      id: 1,
      name: "守夜人",
      tag: "SN",
      intro: "替睡着的人守夜。只收愿意把后背交给队友的人。",
      owner: 1,
      createdAt: now - 60 * day,
      members: [1, 2],
      positions: { 1: "leader", 2: "vice" },
      notice: "每周三 21:00 例行集合。缺席两次清退。",
    },
    {
      id: 2,
      name: "红月信徒",
      tag: "RM",
      intro: "红月之下，规则会变。我们研究变化本身。",
      owner: 3,
      createdAt: now - 40 * day,
      members: [3, 4],
      positions: { 3: "leader", 4: "elite" },
      notice: "红月夜行动自愿，后果自负。",
    },
    {
      id: 3,
      name: "第三扇门",
      tag: "D3",
      intro: "门后有门。我们只负责把门关上。",
      owner: 6,
      createdAt: now - 20 * day,
      members: [6],
      positions: { 6: "leader" },
      notice: "新人先读档案，再谈任务。",
    },
  ];

  const guildMessages = [
    { id: 301, guild: 1, author: 1, at: now - 3 * hour, body: "今晚 21:00 集合，地点老地方。带符。" },
    { id: 302, guild: 1, author: 2, at: now - 2.6 * hour, body: "档案室这边新到了一批 001 的补充记录，我先抄一份。" },
    { id: 303, guild: 2, author: 3, at: now - 5 * hour, body: "红月提前了。31 号 20:00，别迟到。" },
    { id: 304, guild: 2, author: 4, at: now - 4.5 * hour, body: "收到。封印位我来想办法。" },
  ];

  const dms = [
    { id: 401, from: 2, to: 1, at: now - 4 * hour, body: "会长，001 的第四条我补上了。", read: true },
    { id: 402, from: 1, to: 2, at: now - 3.8 * hour, body: "看到了。别写在公开档案里，先压着。", read: true },
    { id: 403, from: 3, to: 1, at: now - 2 * hour, body: "红月缺一个封印位，你那边有人吗？", read: false },
    { id: 404, from: 4, to: 2, at: now - 26 * hour, body: "白鸦姐，新人能进档案室看看吗？", read: true },
    { id: 405, from: 2, to: 4, at: now - 25 * hour, body: "可以。带上工号，别碰最里面那排。", read: false },
  ];

  const notifications = [
    { id: 501, to: 2, type: "reply", text: "沈夜 回复了你的帖子《人皮纸的代价，到底是怎么扣的？》", link: "#/forum/p/105", at: now - 18 * hour, read: false },
    { id: 502, to: 2, type: "follow", text: "林小满 关注了你", link: "#/u/4", at: now - 26 * hour, read: false },
    { id: 503, to: 1, type: "system", text: "你的体验资格申请已通过，工号 W-0017。", link: "#/apply", at: now - 30 * hour, read: true },
  ];

  const applications = [
    {
      id: 601,
      user: 4,
      qq: "100200304",
      reason: "想参加红月夜的四队测试，愿意写反馈。",
      at: now - 8 * hour,
      status: "pending",
    },
    {
      id: 602,
      user: 6,
      qq: "100200306",
      reason: "做过两次封闭测试，能提供完整任务日志。",
      at: now - 30 * hour,
      status: "pending",
    },
    {
      id: 603,
      user: 2,
      qq: "100200302",
      reason: "档案室整理，需要进游戏核对 001 的细节。",
      at: now - 5 * day,
      status: "approved",
      handledBy: 1,
      handledAt: now - 4 * day,
      note: "通过。工号 W-0021。",
    },
  ];

  const announcements = [
    {
      id: 1,
      title: "1.4.0「基地大厅」版本更新",
      tag: "版本",
      at: now - 3 * day,
      author: 1,
      body:
        "【新增】\n· 基地大厅重制：证件、卫星手机、任务档案三栏重排。\n· 门禁卡系统：地下三层起需刷卡，权限随等级提升。\n\n【调整】\n· 连续驾驭超出自身等级的厉鬼，反噬概率 +15%。\n· D 级任务基础积分 12 → 18。",
    },
    {
      id: 2,
      title: "体验资格申请通道开启",
      tag: "资格",
      at: now - 5 * day,
      author: 1,
      body: "即日起开放体验资格申请。\n\n绑定 QQ 后，在「体验资格」页填写理由即可提交。\n管理员会在 3 个工作日内审批，结果通过系统消息通知。\n\n首批名额 500 个。",
    },
    {
      id: 3,
      title: "S 级事件「红月」10 月 31 日降临",
      tag: "活动",
      at: now - 8 * day,
      author: 1,
      body: "10 月 31 日 20:00 起，灵异浓度升至七倍。\n\n· 仅对 B 级及以上驭鬼者开放；\n· 建议四人组队，至少一名封印位；\n· 首通奖励：头像框「红月之眼」。",
    },
    {
      id: 4,
      title: "社区规范与违禁词说明",
      tag: "公告",
      at: now - 12 * day,
      author: 1,
      body: "论坛、公会与私信内禁止发布广告、代练、外挂与联系方式交易信息。\n\n系统会自动过滤违禁词，严重者封禁账号。\n举报请联系管理员。",
    },
  ];

  const settings = {
    applyOpen: true,
    siteNotice: "红月将至：10 月 31 日 20:00，基地进入二级戒备。",
    bannedWords: ["代练", "外挂", "广告", "加群", "私聊出号", "卖号", "脚本"],
  };

  const game = {
    features: [
      { icon: "sword", title: "驾驭厉鬼", desc: "用灵异对抗灵异。等级越高，能驾驭的鬼越强，离反噬也越近。" },
      { icon: "shield", title: "灵异收容", desc: "封印、收容、研究。基地地下三层关着的东西，比任务更危险。" },
      { icon: "map", title: "事件调查", desc: "S / A / B / C / D 五级事件。接取之前，先想好怎么回来。" },
      { icon: "users", title: "四人小队", desc: "感知、输出、封印、善后。少一个人，规矩就会换一种写法。" },
      { icon: "scroll", title: "规矩系统", desc: "鬼不杀人，规矩杀人。找到规矩，就有活路；改掉规矩，就能反过来杀它。" },
      { icon: "gamepad", title: "基地养成", desc: "证件、卫星手机、工作台、仓库。活着回来，才有下一次任务。" },
    ],
    lore: [
      { no: "001", title: "敲门", text: "夜里有人敲门。从猫眼看出去的人，没有脸。它会等你自己开门。" },
      { no: "002", title: "红月", text: "月亮变红的夜晚，规则会变。不要相信你看到的第二个月亮。" },
      { no: "003", title: "人皮纸", text: "一张会自己写字的皮。它从不免费。每读一次，都要付出一点代价。" },
      { no: "004", title: "第三扇门", text: "门后有门。第三扇门打开时，走廊会比你来时更长。" },
    ],
    shots: [
      { src: "assets/img/login.webp", title: "基地登录", note: "红黑认证入口" },
      { src: "assets/img/gatecard.webp", title: "门禁卡与工号", note: "驭鬼者身份凭证" },
      { src: "assets/img/main-ui.webp", title: "基地主界面", note: "证件 · 卫星手机 · 档案" },
    ],
    faq: [
      { q: "《诡异复苏》是什么类型的游戏？", a: "灵异题材的多人合作生存游戏。你扮演一名驭鬼者，调查灵异事件、找出规矩、封印厉鬼，并决定要为力量付出什么。" },
      { q: "如何获得体验资格？", a: "注册账号并绑定 QQ 后，在「体验资格」页提交申请。管理员审批通过后，会通过系统消息发送资格与工号。" },
      { q: "必须绑定 QQ 才能发帖吗？", a: "是的。绑定 QQ 后才能发帖、回复、创建或加入公会、申请体验资格——这是为了防止批量注册与广告。" },
      { q: "可以加入多个公会吗？", a: "不可以。每个账号只能加入一个公会。退出后需要等待 24 小时才能加入新的公会。" },
      { q: "好友是怎么算的？", a: "在论坛点进别人的主页并关注，对方也关注你，就自动成为好友。单向关注只是关注。" },
      { q: "这个网站是官方站吗？", a: "本站为《神秘复苏》同人企划的宣发站，非官方。站内数据用于演示完整的社区流程。" },
    ],
    timeline: [
      { t: "第一年", title: "第一起事件", text: "编号 001 被记录。基地在废墟上建立。" },
      { t: "第三年", title: "驭鬼者体系", text: "第一批驭鬼者完成考核。等级与工号制度确立。" },
      { t: "第五年", title: "红月协议", text: "红月事件被列为 S 级。全球同步警戒。" },
      { t: "现在", title: "复苏加速", text: "灵异浓度持续上升。基地开始对外招募。" },
    ],
  };

  window.SEED = {
    AVATARS,
    CATEGORIES,
    POSITIONS,
    users,
    posts,
    replies,
    guilds,
    guildMessages,
    dms,
    notifications,
    applications,
    announcements,
    settings,
    game,
  };
})();
