function main(config) {
  const ICON_BASE = "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/";
  const RULE_BASE = "https://cdn.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/";
  const LOW_RATIO_THRESHOLD = 0.5;
  const PRIMARY_GROUP_NAME = "常见节点";
  const MINOR_GROUP_NAME = "小众节点";
  const MANUAL_GROUP_NAME = "手动切换";
  const OTHER_REGION_NAME = "其他地区";

  const ratioRegex = /(?:\[(\d+(?:\.\d+)?)\s*(?:x|X|×)\]|(\d+(?:\.\d+)?)\s*(?:x|X|×|倍)|(?:x|X|×|倍)\s*(\d+(?:\.\d+)?))/i;
  const blackListRegex = /(?<!集)群|邀请|返利|官方|网址|订阅|购买|续费|剩余|到期|过期|流量|备用|邮箱|客服|联系|工单|倒卖|防止|梯子|tg|发布|重置/i;
  const FLAG_TO_CODE = {
    "🇭🇰": "HK",
    "🇸🇬": "SG",
    "🇹🇼": "TW",
    "🇲🇴": "MO",
    "🇯🇵": "JP",
    "🇰🇷": "KR",
    "🇺🇸": "US",
    "🇨🇦": "CA",
    "🇲🇽": "MX",
    "🇧🇷": "BR",
    "🇭🇳": "HN",
    "🇨🇱": "CL",
    "🇦🇷": "AR",
    "🇺🇾": "UY",
    "🇬🇫": "GF",
    "🇨🇴": "CO",
    "🇪🇨": "EC",
    "🇵🇪": "PE",
    "🇧🇴": "BO",
    "🇩🇪": "DE",
    "🇬🇧": "GB",
    "🇫🇷": "FR",
    "🇳🇱": "NL",
    "🇪🇸": "ES",
    "🇮🇪": "IE",
    "🇮🇹": "IT",
    "🇱🇺": "LU",
    "🇨🇭": "CH",
    "🇩🇰": "DK",
    "🇫🇮": "FI",
    "🇸🇪": "SE",
    "🇳🇴": "NO",
    "🇦🇹": "AT",
    "🇨🇿": "CZ",
    "🇸🇰": "SK",
    "🇸🇮": "SI",
    "🇭🇷": "HR",
    "🇮🇸": "IS",
    "🇧🇪": "BE",
    "🇵🇹": "PT",
    "🇵🇱": "PL",
    "🇱🇹": "LT",
    "🇪🇪": "EE",
    "🇱🇻": "LV",
    "🇭🇺": "HU",
    "🇷🇺": "RU",
    "🇺🇦": "UA",
    "🇲🇩": "MD",
    "🇷🇴": "RO",
    "🇧🇬": "BG",
    "🇷🇸": "RS",
    "🇲🇰": "MK",
    "🇲🇹": "MT",
    "🇬🇷": "GR",
    "🇹🇷": "TR",
    "🇮🇶": "IQ",
    "🇮🇱": "IL",
    "🇱🇧": "LB",
    "🇦🇪": "AE",
    "🇸🇦": "SA",
    "🇦🇿": "AZ",
    "🇰🇿": "KZ",
    "🇰🇬": "KG",
    "🇹🇯": "TJ",
    "🇵🇰": "PK",
    "🇧🇭": "BH",
    "🇪🇬": "EG",
    "🇳🇬": "NG",
    "🇪🇹": "ET",
    "🇦🇴": "AO",
    "🇰🇪": "KE",
    "🇿🇦": "ZA",
    "🇩🇿": "DZ",
    "🇬🇱": "GL",
    "🇦🇶": "AQ",
    "🇵🇭": "PH",
    "🇲🇾": "MY",
    "🇹🇭": "TH",
    "🇮🇳": "IN",
    "🇮🇩": "ID",
    "🇻🇳": "VN",
    "🇰🇭": "KH",
    "🇧🇩": "BD",
    "🇳🇵": "NP",
    "🇲🇳": "MN",
    "🇲🇲": "MM",
    "🇱🇦": "LA",
    "🇰🇵": "KP",
    "🇦🇺": "AU",
    "🇳🇿": "NZ"
  };
  const defineRegion = (name, keywords, codes, icon = "Proxy.png") => ({ name, keywords, codes, icon });

  const COMMON_REGIONS = [
    defineRegion("美国", ["美国", "美", "United States", "纽约", "New York", "洛杉矶", "Los Angeles", "旧金山", "San Francisco", "圣何塞", "San Jose", "西雅图", "Seattle", "芝加哥", "Chicago", "达拉斯", "Dallas", "硅谷", "Silicon Valley"], ["US", "USA", "NYC", "JFK", "LAX", "SFO", "SJC", "SEA", "ORD", "DFW"], "United_States.png"),
    defineRegion("新加坡", ["新加坡", "狮城", "Singapore"], ["SG", "SGP", "SIN"], "Singapore.png"),
    defineRegion("日本", ["日本", "日", "Japan", "东京", "Tokyo", "大阪", "Osaka"], ["JP", "JPN", "TYO", "NRT", "HND", "KIX"], "Japan.png"),
    defineRegion("香港", ["香港", "港", "Hong Kong", "中国香港"], ["HK", "HKG"], "Hong_Kong.png"),
    defineRegion("台湾", ["台湾", "台灣", "臺灣", "Taiwan", "台北", "Taipei", "新北", "New Taipei", "中国台湾"], ["TW", "TWN", "TPE"], "Taiwan.png")
  ];
  const MINOR_REGIONS = [
    defineRegion("澳门", ["澳门", "澳門", "Macau", "Macao", "中国澳门"], ["MO", "MAC", "MFM"]),
    defineRegion("韩国", ["韩国", "韓國", "South Korea", "Korea", "首尔", "Seoul", "釜山", "Busan"], ["KR", "KOR", "ICN", "PUS"]),
    defineRegion("菲律宾", ["菲律宾", "菲律賓", "Philippines", "马尼拉", "Manila"], ["PH", "PHL", "MNL"]),
    defineRegion("马来西亚", ["马来西亚", "馬來西亞", "Malaysia", "吉隆坡", "Kuala Lumpur"], ["MY", "MYS", "KUL"]),
    defineRegion("泰国", ["泰国", "Thailand", "曼谷", "Bangkok"], ["TH", "THA", "BKK", "DMK"]),
    defineRegion("印尼", ["印尼", "印度尼西亚", "印度尼西亞", "Indonesia", "雅加达", "Jakarta"], ["ID", "IDN", "CGK"]),
    defineRegion("印度", ["印度", "India", "孟买", "Mumbai", "班加罗尔", "Bangalore"], ["IN", "IND", "BOM", "BLR"]),
    defineRegion("越南", ["越南", "Vietnam", "河内", "Hanoi", "胡志明", "Ho Chi Minh"], ["VN", "VNM", "HAN", "SGN"]),
    defineRegion("柬埔寨", ["柬埔寨", "Cambodia"], ["KH", "KHM"]),
    defineRegion("孟加拉国", ["孟加拉国", "孟加拉國", "Bangladesh"], ["BD", "BGD"]),
    defineRegion("尼泊尔", ["尼泊尔", "Nepal"], ["NP", "NPL"]),
    defineRegion("蒙古国", ["蒙古国", "蒙古國", "蒙古", "Mongolia"], ["MN", "MNG"]),
    defineRegion("缅甸", ["缅甸", "緬甸", "Myanmar", "Burma"], ["MM", "MMR"]),
    defineRegion("老挝", ["老挝", "老撾", "Laos"], ["LA", "LAO"]),
    defineRegion("朝鲜", ["朝鲜", "朝鮮", "North Korea", "DPRK"], ["KP", "PRK"]),
    defineRegion("澳大利亚", ["澳大利亚", "澳大利亞", "Australia", "悉尼", "Sydney", "墨尔本", "Melbourne", "布里斯班", "Brisbane"], ["AU", "AUS", "SYD", "MEL", "BNE"]),
    defineRegion("新西兰", ["新西兰", "新西蘭", "New Zealand", "奥克兰", "Auckland"], ["NZ", "NZL", "AKL"]),
    defineRegion("加拿大", ["加拿大", "Canada", "多伦多", "Toronto", "温哥华", "Vancouver", "蒙特利尔", "Montreal"], ["CA", "CAN", "YYZ", "YVR", "YUL"]),
    defineRegion("墨西哥", ["墨西哥", "Mexico", "墨西哥城", "Mexico City"], ["MX", "MEX"]),
    defineRegion("巴西", ["巴西", "Brazil", "圣保罗", "Sao Paulo"], ["BR", "BRA", "GRU"]),
    defineRegion("洪都拉斯", ["洪都拉斯", "Honduras"], ["HN", "HND"]),
    defineRegion("智利", ["智利", "Chile"], ["CL", "CHL"]),
    defineRegion("阿根廷", ["阿根廷", "Argentina", "布宜诺斯艾利斯", "Buenos Aires"], ["AR", "ARG", "EZE"]),
    defineRegion("乌拉圭", ["乌拉圭", "烏拉圭", "Uruguay"], ["UY", "URY"]),
    defineRegion("法属圭亚那", ["法属圭亚那", "法屬圭亞那", "French Guiana"], ["GF", "GUF"]),
    defineRegion("哥伦比亚", ["哥伦比亚", "哥倫比亞", "Colombia"], ["CO", "COL"]),
    defineRegion("厄瓜多尔", ["厄瓜多尔", "厄瓜多爾", "Ecuador"], ["EC", "ECU"]),
    defineRegion("秘鲁", ["秘鲁", "祕魯", "Peru"], ["PE", "PER"]),
    defineRegion("玻利维亚", ["玻利维亚", "玻利維亞", "Bolivia"], ["BO", "BOL"]),
    defineRegion("德国", ["德国", "德國", "Germany", "法兰克福", "Frankfurt"], ["DE", "DEU", "FRA"]),
    defineRegion("英国", ["英国", "英國", "United Kingdom", "England", "伦敦", "London", "曼彻斯特", "Manchester"], ["UK", "GB", "GBR", "LHR", "LGW", "MAN"]),
    defineRegion("法国", ["法国", "法國", "France", "巴黎", "Paris"], ["FR", "CDG"]),
    defineRegion("荷兰", ["荷兰", "荷蘭", "Netherlands", "阿姆斯特丹", "Amsterdam"], ["NL", "NLD", "AMS"]),
    defineRegion("西班牙", ["西班牙", "Spain", "马德里", "Madrid"], ["ES", "ESP", "MAD"]),
    defineRegion("爱尔兰", ["爱尔兰", "愛爾蘭", "Ireland"], ["IE", "IRL"]),
    defineRegion("意大利", ["意大利", "Italy", "米兰", "Milan", "罗马", "Rome"], ["IT", "ITA", "MXP", "FCO"]),
    defineRegion("卢森堡", ["卢森堡", "盧森堡", "Luxembourg"], ["LU", "LUX"]),
    defineRegion("瑞士", ["瑞士", "Switzerland", "苏黎世", "Zurich"], ["CH", "CHE", "ZRH"]),
    defineRegion("丹麦", ["丹麦", "丹麥", "Denmark", "哥本哈根", "Copenhagen"], ["DK", "DNK", "CPH"]),
    defineRegion("芬兰", ["芬兰", "芬蘭", "Finland"], ["FI", "FIN"]),
    defineRegion("瑞典", ["瑞典", "Sweden", "斯德哥尔摩", "Stockholm"], ["SE", "SWE", "ARN"]),
    defineRegion("挪威", ["挪威", "Norway", "奥斯陆", "Oslo"], ["NO", "NOR", "OSL"]),
    defineRegion("奥地利", ["奥地利", "奧地利", "Austria"], ["AT", "AUT"]),
    defineRegion("捷克", ["捷克", "Czechia", "Czech Republic"], ["CZ", "CZE"]),
    defineRegion("斯洛伐克", ["斯洛伐克", "Slovakia"], ["SK", "SVK"]),
    defineRegion("斯洛文尼亚", ["斯洛文尼亚", "斯洛文尼亞", "Slovenia"], ["SI", "SVN"]),
    defineRegion("克罗地亚", ["克罗地亚", "克羅地亞", "Croatia"], ["HR", "HRV"]),
    defineRegion("冰岛", ["冰岛", "冰島", "Iceland"], ["IS", "ISL"]),
    defineRegion("比利时", ["比利时", "比利時", "Belgium"], ["BE", "BEL"]),
    defineRegion("葡萄牙", ["葡萄牙", "Portugal"], ["PT", "PRT"]),
    defineRegion("波兰", ["波兰", "波蘭", "Poland"], ["PL", "POL"]),
    defineRegion("立陶宛", ["立陶宛", "Lithuania"], ["LT", "LTU"]),
    defineRegion("爱沙尼亚", ["爱沙尼亚", "愛沙尼亞", "Estonia"], ["EE", "EST"]),
    defineRegion("拉脱维亚", ["拉脱维亚", "拉脫維亞", "Latvia"], ["LV", "LVA"]),
    defineRegion("匈牙利", ["匈牙利", "Hungary"], ["HU", "HUN"]),
    defineRegion("俄罗斯", ["俄罗斯", "俄羅斯", "Russia", "莫斯科", "Moscow"], ["RU", "RUS", "SVO"]),
    defineRegion("乌克兰", ["乌克兰", "烏克蘭", "Ukraine"], ["UA", "UKR"]),
    defineRegion("摩尔多瓦", ["摩尔多瓦", "摩爾多瓦", "Moldova"], ["MD", "MDA"]),
    defineRegion("罗马尼亚", ["罗马尼亚", "羅馬尼亞", "Romania"], ["RO", "ROU"]),
    defineRegion("保加利亚", ["保加利亚", "保加利亞", "Bulgaria"], ["BG", "BGR"]),
    defineRegion("塞尔维亚", ["塞尔维亚", "塞爾維亞", "Serbia"], ["RS", "SRB"]),
    defineRegion("北马其顿", ["北马其顿", "北馬其頓", "North Macedonia"], ["MK", "MKD"]),
    defineRegion("马耳他", ["马耳他", "馬耳他", "Malta"], ["MT", "MLT"]),
    defineRegion("希腊", ["希腊", "希臘", "Greece"], ["GR", "GRC"]),
    defineRegion("土耳其", ["土耳其", "Turkey", "伊斯坦布尔", "Istanbul"], ["TR", "TUR", "IST"]),
    defineRegion("伊拉克", ["伊拉克", "Iraq"], ["IQ", "IRQ"]),
    defineRegion("以色列", ["以色列", "Israel"], ["IL", "ISR"]),
    defineRegion("黎巴嫩", ["黎巴嫩", "Lebanon"], ["LB", "LBN"]),
    defineRegion("阿联酋", ["阿联酋", "阿聯酋", "United Arab Emirates", "迪拜", "Dubai", "阿布扎比", "Abu Dhabi"], ["AE", "ARE", "DXB", "AUH"]),
    defineRegion("沙特阿拉伯", ["沙特", "沙特阿拉伯", "Saudi Arabia", "利雅得", "Riyadh"], ["SA", "SAU", "RUH"]),
    defineRegion("阿塞拜疆", ["阿塞拜疆", "Azerbaijan"], ["AZ", "AZE"]),
    defineRegion("哈萨克斯坦", ["哈萨克斯坦", "哈薩克斯坦", "Kazakhstan"], ["KZ", "KAZ"]),
    defineRegion("吉尔吉斯斯坦", ["吉尔吉斯斯坦", "吉爾吉斯斯坦", "Kyrgyzstan"], ["KG", "KGZ"]),
    defineRegion("塔吉克斯坦", ["塔吉克", "塔吉克斯坦", "Tajikistan"], ["TJ", "TJK"]),
    defineRegion("巴基斯坦", ["巴基斯坦", "Pakistan"], ["PK", "PAK"]),
    defineRegion("巴林", ["巴林", "Bahrain"], ["BH", "BHR"]),
    defineRegion("埃及", ["埃及", "Egypt"], ["EG", "EGY"]),
    defineRegion("尼日利亚", ["尼日利亚", "尼日利亞", "Nigeria", "拉各斯", "Lagos", "阿布贾", "Abuja"], ["NG", "NGA", "LOS", "ABV"]),
    defineRegion("埃塞俄比亚", ["埃塞俄比亚", "埃塞俄比亞", "Ethiopia"], ["ET", "ETH"]),
    defineRegion("安哥拉", ["安哥拉", "Angola"], ["AO", "AGO"]),
    defineRegion("肯尼亚", ["肯尼亚", "肯尼亞", "Kenya"], ["KE", "KEN"]),
    defineRegion("南非", ["南非", "South Africa", "约翰内斯堡", "Johannesburg"], ["ZA", "ZAF", "JNB"]),
    defineRegion("阿尔及利亚", ["阿尔及利亚", "阿爾及利亞", "Algeria"], ["DZ", "DZA"]),
    defineRegion("格陵兰岛", ["格陵兰岛", "格陵蘭島", "Greenland"], ["GL", "GRL"]),
    defineRegion("南极洲", ["南极洲", "南極洲", "Antarctica"], ["AQ", "ATA"])
  ];
  const ORDERED_REGIONS = [
    ...COMMON_REGIONS.map(region => ({ ...region, tier: "common" })),
    ...MINOR_REGIONS.map(region => ({ ...region, tier: "minor" }))
  ];

  const originalProxies = config.proxies || [];
  const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const normalizeName = value => {
    let normalized = (value || "").trim().replace(/\s+/g, "").replace(/[【】[\]（）()]/g, "").toUpperCase();
    for (const [flag, code] of Object.entries(FLAG_TO_CODE)) normalized = normalized.split(flag).join(code);
    return normalized;
  };
  const getProxyRatio = name => {
    const match = name.match(ratioRegex);
    const ratio = parseFloat(match?.[1] || match?.[2] || match?.[3]);
    return Number.isFinite(ratio) ? ratio : null;
  };
  const getLowRatioGroupName = regionName => `${regionName}低倍率`;
  const buildKeywordPattern = keyword => {
    const normalizedKeyword = normalizeName(keyword);
    const escapedKeyword = escapeRegex(normalizedKeyword);
    if (/^[\u4E00-\u9FFF]$/.test(normalizedKeyword)) {
      return `(?<![\\u4E00-\\u9FFF])${escapedKeyword}|${escapedKeyword}(?![\\u4E00-\\u9FFF])`;
    }
    return escapedKeyword;
  };
  const buildRegionRegex = region => {
    const keywordPatterns = (region.keywords || []).map(buildKeywordPattern);
    const codePatterns = (region.codes || []).map(code => `(?<![A-Z])${escapeRegex(normalizeName(code))}(?![A-Z])`);
    return new RegExp([...keywordPatterns, ...codePatterns].join("|"), "i");
  };

  const filteredProxies = originalProxies
    .filter(proxy => proxy?.name && !blackListRegex.test(proxy.name))
    .map(proxy => ({ ...proxy, __ratio: getProxyRatio(proxy.name) }))
    .filter(proxy => !(proxy.__ratio !== null && proxy.__ratio > 3.0));

  if (!filteredProxies.length && !originalProxies.length) return config;

  const proxiesWithNorm = filteredProxies.map(proxy => ({
    ...proxy,
    __normName: normalizeName(proxy.name)
  }));

  const collectActiveRegions = () => {
    const regionStates = ORDERED_REGIONS.map(region => ({
      ...region,
      __regex: buildRegionRegex(region),
      proxies: [],
      lowRatioProxies: []
    }));
    const unmatchedProxies = [];

    for (const proxy of proxiesWithNorm) {
      const matchedRegion = regionStates.find(region => region.__regex.test(proxy.__normName));
      if (!matchedRegion) {
        unmatchedProxies.push(proxy.name);
        continue;
      }
      matchedRegion.proxies.push(proxy.name);
      if (matchedRegion.tier === "common" && proxy.__ratio !== null && proxy.__ratio <= LOW_RATIO_THRESHOLD) {
        matchedRegion.lowRatioProxies.push(proxy.name);
      }
    }

    return {
      activeCommonRegions: regionStates
        .filter(region => region.tier === "common" && region.proxies.length > 0)
        .map(({ __regex, ...region }) => region),
      activeMinorRegions: regionStates
        .filter(region => region.tier === "minor" && region.proxies.length > 0)
        .map(({ __regex, ...region }) => region),
      unmatchedProxies
    };
  };

  const { activeCommonRegions, activeMinorRegions, unmatchedProxies } = collectActiveRegions();

  const commonSelectionNames = activeCommonRegions.flatMap(region => {
    const names = [region.name];
    if (region.lowRatioProxies.length > 0) names.push(getLowRatioGroupName(region.name));
    return names;
  });
  const minorSelectionNames = [
    ...activeMinorRegions.map(region => region.name),
    ...(unmatchedProxies.length > 0 ? [OTHER_REGION_NAME] : [])
  ];

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
  const orderedMinorRegionGroups = [
    ...activeMinorRegions.map(region => ({
      name: region.name,
      icon: `${ICON_BASE}Proxy.png`,
      type: "url-test",
      hidden: true,
      proxies: region.proxies,
      interval: 300,
      tolerance: 50
    })),
    ...(unmatchedProxies.length > 0
      ? [{
          name: OTHER_REGION_NAME,
          icon: `${ICON_BASE}Proxy.png`,
          type: "url-test",
          hidden: true,
          proxies: unmatchedProxies,
          interval: 300,
          tolerance: 50
        }]
      : [])
  ];
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

  const validTargets = new Set(["DIRECT", "REJECT", "REJECT-DROP", "PASS", ...proxyGroups.map(group => group.name), ...originalProxies.map(proxy => proxy.name)]);

  const customRules = (config.rules || [])
    .filter(rule => !rule.startsWith("MATCH,"))
    .map(rule => {
      const parts = rule.split(",");
      if (parts.length >= 3 && !validTargets.has(parts[2].trim())) parts[2] = PRIMARY_GROUP_NAME;
      return parts.join(",");
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
