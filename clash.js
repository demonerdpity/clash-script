function main(config) {
  const ICON_BASE = "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/";
  const RULE_BASE = "https://cdn.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/";
  const LOW_RATIO_THRESHOLD = 0.5;
  const PRIMARY_GROUP_NAME = "常见节点";
  const MINOR_GROUP_NAME = "小众节点";
  const MANUAL_GROUP_NAME = "手动切换";

  const ratioRegex = /(?:\[(\d+(?:\.\d+)?)\s*(?:x|X|×)\]|(\d+(?:\.\d+)?)\s*(?:x|X|×|倍)|(?:x|X|×|倍)\s*(\d+(?:\.\d+)?))/i;
  const blackListRegex = /(?<!集)群|邀请|返利|官方|网址|订阅|购买|续费|剩余|到期|过期|流量|备用|邮箱|客服|联系|工单|倒卖|防止|梯子|tg|发布|重置/i;
  const FLAG_TO_CODE = {
    "🇺🇸": "US",
    "🇯🇵": "JP",
    "🇭🇰": "HK",
    "🇹🇼": "TW",
    "🇸🇬": "SG",
    "🇲🇴": "MO",
    "🇰🇷": "KR",
    "🇬🇧": "GB",
    "🇩🇪": "DE",
    "🇫🇷": "FR",
    "🇳🇱": "NL",
    "🇨🇦": "CA",
    "🇦🇺": "AU",
    "🇳🇿": "NZ",
    "🇲🇾": "MY",
    "🇹🇭": "TH",
    "🇮🇳": "IN",
    "🇮🇩": "ID",
    "🇵🇭": "PH",
    "🇻🇳": "VN",
    "🇷🇺": "RU",
    "🇹🇷": "TR",
    "🇦🇪": "AE",
    "🇸🇦": "SA",
    "🇿🇦": "ZA",
    "🇧🇷": "BR",
    "🇦🇷": "AR",
    "🇲🇽": "MX",
    "🇪🇸": "ES",
    "🇮🇹": "IT",
    "🇨🇭": "CH",
    "🇸🇪": "SE",
    "🇳🇴": "NO",
    "🇩🇰": "DK"
  };

  const originalProxies = config.proxies || [];
  const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const normalizeName = value => {
    let normalized = (value || "").trim().replace(/\s+/g, '').replace(/[【】[\]（）()]/g, '').toUpperCase();
    for (const [flag, code] of Object.entries(FLAG_TO_CODE)) normalized = normalized.split(flag).join(code);
    return normalized;
  };
  const getProxyRatio = name => {
    const match = name.match(ratioRegex);
    const ratio = parseFloat(match?.[1] || match?.[2] || match?.[3]);
    return Number.isFinite(ratio) ? ratio : null;
  };
  const getLowRatioGroupName = regionName => `${regionName}低倍率`;
  const buildRegionRegex = region => {
    const keywordPatterns = (region.keywords || []).map(keyword => escapeRegex(normalizeName(keyword)));
    const codePatterns = (region.codes || []).map(code => `(?<![A-Z])${escapeRegex(normalizeName(code))}(?![A-Z])`);
    return new RegExp([...keywordPatterns, ...codePatterns].join('|'), 'i');
  };

  const filteredProxies = originalProxies
    .filter(p => p?.name && !blackListRegex.test(p.name))
    .map(p => ({ ...p, __ratio: getProxyRatio(p.name) }))
    .filter(p => !(p.__ratio !== null && p.__ratio > 3.0));

  if (!filteredProxies.length && !originalProxies.length) return config;

  const proxiesWithNorm = filteredProxies.map(p => ({
    ...p,
    __normName: normalizeName(p.name)
  }));

  const COMMON_REGIONS = [
    { name: "美国", icon: "United_States.png", keywords: ["美国", "美", "United States", "纽约", "New York", "洛杉矶", "Los Angeles", "旧金山", "San Francisco", "圣何塞", "San Jose", "西雅图", "Seattle", "芝加哥", "Chicago", "达拉斯", "Dallas", "硅谷", "Silicon Valley"], codes: ["US", "USA", "NYC", "JFK", "LAX", "SFO", "SJC", "SEA", "ORD", "DFW"] },
    { name: "新加坡", icon: "Singapore.png", keywords: ["新加坡", "狮城", "Singapore"], codes: ["SG", "SGP", "SIN"] },
    { name: "日本", icon: "Japan.png", keywords: ["日本", "日", "Japan", "东京", "Tokyo", "大阪", "Osaka"], codes: ["JP", "JPN", "TYO", "NRT", "HND", "KIX"] },
    { name: "香港", icon: "Hong_Kong.png", keywords: ["香港", "港", "Hong Kong"], codes: ["HK", "HKG"] },
    { name: "台湾", icon: "Taiwan.png", keywords: ["台湾", "台", "Taiwan", "台北", "Taipei", "新北", "New Taipei"], codes: ["TW", "TWN", "TPE"] }
  ];
  const MINOR_REGIONS = [
    { name: "澳门", icon: "Macau.png", keywords: ["澳门", "Macau", "Macao"], codes: ["MO", "MFM"] },
    { name: "韩国", icon: "South_Korea.png", keywords: ["韩国", "South Korea", "Korea", "首尔", "Seoul", "釜山", "Busan"], codes: ["KR", "KOR", "ICN", "PUS"] },
    { name: "英国", icon: "United_Kingdom.png", keywords: ["英国", "United Kingdom", "England", "伦敦", "London", "曼彻斯特", "Manchester"], codes: ["UK", "GB", "GBR", "LHR", "LGW", "MAN"] },
    { name: "德国", icon: "Germany.png", keywords: ["德国", "Germany", "法兰克福", "Frankfurt"], codes: ["DE", "DEU", "FRA"] },
    { name: "法国", icon: "France.png", keywords: ["法国", "France", "巴黎", "Paris"], codes: ["FR", "CDG"] },
    { name: "荷兰", icon: "Netherlands.png", keywords: ["荷兰", "Netherlands", "阿姆斯特丹", "Amsterdam"], codes: ["NL", "NLD", "AMS"] },
    { name: "加拿大", icon: "Canada.png", keywords: ["加拿大", "Canada", "多伦多", "Toronto", "温哥华", "Vancouver", "蒙特利尔", "Montreal"], codes: ["CA", "CAN", "YYZ", "YVR", "YUL"] },
    { name: "澳大利亚", icon: "Australia.png", keywords: ["澳大利亚", "Australia", "悉尼", "Sydney", "墨尔本", "Melbourne"], codes: ["AU", "AUS", "SYD", "MEL"] },
    { name: "新西兰", icon: "New_Zealand.png", keywords: ["新西兰", "New Zealand", "奥克兰", "Auckland"], codes: ["NZ", "NZL", "AKL"] },
    { name: "马来西亚", icon: "Malaysia.png", keywords: ["马来西亚", "Malaysia", "吉隆坡", "Kuala Lumpur"], codes: ["MY", "MYS", "KUL"] },
    { name: "泰国", icon: "Thailand.png", keywords: ["泰国", "Thailand", "曼谷", "Bangkok"], codes: ["TH", "THA", "BKK", "DMK"] },
    { name: "印度", icon: "India.png", keywords: ["印度", "India", "孟买", "Mumbai", "班加罗尔", "Bangalore"], codes: ["IN", "IND", "BOM", "BLR"] },
    { name: "印尼", icon: "Indonesia.png", keywords: ["印尼", "印度尼西亚", "Indonesia", "雅加达", "Jakarta"], codes: ["ID", "IDN", "CGK"] },
    { name: "菲律宾", icon: "Philippines.png", keywords: ["菲律宾", "Philippines", "马尼拉", "Manila"], codes: ["PH", "PHL", "MNL"] },
    { name: "越南", icon: "Vietnam.png", keywords: ["越南", "Vietnam", "河内", "Hanoi", "胡志明", "Ho Chi Minh"], codes: ["VN", "VNM", "HAN", "SGN"] },
    { name: "俄罗斯", icon: "Russia.png", keywords: ["俄罗斯", "Russia", "莫斯科", "Moscow"], codes: ["RU", "RUS", "SVO"] },
    { name: "土耳其", icon: "Turkey.png", keywords: ["土耳其", "Turkey", "伊斯坦布尔", "Istanbul"], codes: ["TR", "TUR", "IST"] },
    { name: "阿联酋", icon: "United_Arab_Emirates.png", keywords: ["阿联酋", "United Arab Emirates", "迪拜", "Dubai", "阿布扎比", "Abu Dhabi"], codes: ["AE", "ARE", "DXB", "AUH"] },
    { name: "沙特", icon: "Saudi_Arabia.png", keywords: ["沙特", "Saudi Arabia", "利雅得", "Riyadh"], codes: ["SA", "SAU", "RUH"] },
    { name: "南非", icon: "South_Africa.png", keywords: ["南非", "South Africa", "约翰内斯堡", "Johannesburg"], codes: ["ZA", "ZAF", "JNB"] },
    { name: "巴西", icon: "Brazil.png", keywords: ["巴西", "Brazil", "圣保罗", "Sao Paulo"], codes: ["BR", "BRA", "GRU"] },
    { name: "阿根廷", icon: "Argentina.png", keywords: ["阿根廷", "Argentina", "布宜诺斯艾利斯", "Buenos Aires"], codes: ["AR", "ARG", "EZE"] },
    { name: "墨西哥", icon: "Mexico.png", keywords: ["墨西哥", "Mexico", "墨西哥城", "Mexico City"], codes: ["MX", "MEX"] },
    { name: "西班牙", icon: "Spain.png", keywords: ["西班牙", "Spain", "马德里", "Madrid"], codes: ["ES", "ESP", "MAD"] },
    { name: "意大利", icon: "Italy.png", keywords: ["意大利", "Italy", "米兰", "Milan", "罗马", "Rome"], codes: ["IT", "ITA", "MXP", "FCO"] },
    { name: "瑞士", icon: "Switzerland.png", keywords: ["瑞士", "Switzerland", "苏黎世", "Zurich"], codes: ["CH", "CHE", "ZRH"] },
    { name: "瑞典", icon: "Sweden.png", keywords: ["瑞典", "Sweden", "斯德哥尔摩", "Stockholm"], codes: ["SE", "SWE", "ARN"] },
    { name: "挪威", icon: "Norway.png", keywords: ["挪威", "Norway", "奥斯陆", "Oslo"], codes: ["NO", "NOR", "OSL"] },
    { name: "丹麦", icon: "Denmark.png", keywords: ["丹麦", "Denmark", "哥本哈根", "Copenhagen"], codes: ["DK", "DNK", "CPH"] }
  ];
  const collectActiveRegions = (regions, includeLowRatio = false) => regions.map(region => {
    const regex = buildRegionRegex(region);
    const matchedProxies = proxiesWithNorm.filter(p => regex.test(p.__normName));
    const activeRegion = { ...region, proxies: matchedProxies.map(p => p.name) };
    if (includeLowRatio) {
      activeRegion.lowRatioProxies = matchedProxies
        .filter(p => p.__ratio !== null && p.__ratio <= LOW_RATIO_THRESHOLD)
        .map(p => p.name);
    }
    return activeRegion;
  }).filter(region => region.proxies.length > 0);

  const activeCommonRegions = collectActiveRegions(COMMON_REGIONS, true);
  const activeMinorRegions = collectActiveRegions(MINOR_REGIONS);

  const commonSelectionNames = activeCommonRegions.flatMap(region => {
    const names = [region.name];
    if (region.lowRatioProxies.length > 0) names.push(getLowRatioGroupName(region.name));
    return names;
  });
  const minorSelectionNames = activeMinorRegions.map(region => region.name);

  const orderedCommonRegionGroups = activeCommonRegions.flatMap(region => {
    const groups = [
      { name: region.name, icon: `${ICON_BASE}${region.icon}`, type: "url-test", proxies: region.proxies, interval: 300, tolerance: 50 }
    ];
    if (region.lowRatioProxies.length > 0) {
      groups.push({
        name: getLowRatioGroupName(region.name),
        icon: `${ICON_BASE}${region.icon}`,
        type: "url-test",
        proxies: region.lowRatioProxies,
        interval: 300,
        tolerance: 50
      });
    }
    return groups;
  });
  const orderedMinorRegionGroups = activeMinorRegions.map(region => ({
    name: region.name,
    icon: `${ICON_BASE}Proxy.png`,
    type: "url-test",
    hidden: true,
    proxies: region.proxies,
    interval: 300,
    tolerance: 50
  }));
  const globalSelectionNames = [
    PRIMARY_GROUP_NAME,
    ...(minorSelectionNames.length > 0 ? [MINOR_GROUP_NAME] : []),
    ...commonSelectionNames,
    ...minorSelectionNames,
    MANUAL_GROUP_NAME,
    "DIRECT"
  ];

  const proxyGroups = [
    { name: PRIMARY_GROUP_NAME, icon: `${ICON_BASE}Proxy.png`, type: "select", proxies: commonSelectionNames },
    ...(minorSelectionNames.length > 0 ? [{ name: MINOR_GROUP_NAME, icon: `${ICON_BASE}Proxy.png`, type: "select", proxies: minorSelectionNames }] : []),
    ...orderedCommonRegionGroups,
    ...orderedMinorRegionGroups,
    { name: MANUAL_GROUP_NAME, icon: `${ICON_BASE}Available.png`, "include-all": true, type: "select" },
    { name: "GLOBAL", icon: `${ICON_BASE}Global.png`, type: "select", proxies: globalSelectionNames }
  ];
  config["proxy-groups"] = proxyGroups;

  config["rule-providers"] = {
    LocalAreaNetwork: { url: `${RULE_BASE}LocalAreaNetwork.list`, path: "./ruleset/LocalAreaNetwork.list", behavior: "classical", interval: 86400, format: "text", type: "http" },
    UnBan: { url: `${RULE_BASE}UnBan.list`, path: "./ruleset/UnBan.list", behavior: "classical", interval: 86400, format: "text", type: "http" },
    BanAD: { url: `${RULE_BASE}BanAD.list`, path: "./ruleset/BanAD.list", behavior: "classical", interval: 86400, format: "text", type: "http" },
    BanProgramAD: { url: `${RULE_BASE}BanProgramAD.list`, path: "./ruleset/BanProgramAD.list", behavior: "classical", interval: 86400, format: "text", type: "http" },
    ProxyGFWlist: { url: `${RULE_BASE}ProxyGFWlist.list`, path: "./ruleset/ProxyGFWlist.list", behavior: "classical", interval: 86400, format: "text", type: "http" },
    ChinaDomain: { url: `${RULE_BASE}ChinaDomain.list`, path: "./ruleset/ChinaDomain.list", behavior: "classical", interval: 86400, format: "text", type: "http" }
  };

  const validTargets = new Set(["DIRECT", "REJECT", "REJECT-DROP", "PASS", ...proxyGroups.map(g => g.name), ...originalProxies.map(p => p.name)]);
  
  const customRules = (config.rules || [])
    .filter(rule => !rule.startsWith("MATCH,"))
    .map(rule => {
      let parts = rule.split(',');
      if (parts.length >= 3 && !validTargets.has(parts[2].trim())) parts[2] = PRIMARY_GROUP_NAME; 
      return parts.join(',');
    });

  config["rules"] = [
    "RULE-SET,LocalAreaNetwork,DIRECT",
    "RULE-SET,UnBan,DIRECT",
    "RULE-SET,BanAD,REJECT",
    "RULE-SET,BanProgramAD,REJECT",
    ...customRules, 
    `RULE-SET,ProxyGFWlist,${PRIMARY_GROUP_NAME}`,
    "RULE-SET,ChinaDomain,DIRECT",
    "GEOIP,CN,DIRECT",
    `MATCH,${PRIMARY_GROUP_NAME}`
  ];

  config.proxies = originalProxies;
  return config;
}
