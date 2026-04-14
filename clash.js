function main(config) {
  const ICON_BASE = "https://cdn.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/";
  const RULE_BASE = "https://cdn.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/";
  const LOW_RATIO_THRESHOLD = 0.5;

  const ratioRegex = /(?:\[(\d+(?:\.\d+)?)\s*(?:x|X|×)\]|(\d+(?:\.\d+)?)\s*(?:x|X|×|倍)|(?:x|X|×|倍)\s*(\d+(?:\.\d+)?))/i;
  const blackListRegex = /(?<!集)群|邀请|返利|官方|网址|订阅|购买|续费|剩余|到期|过期|流量|备用|邮箱|客服|联系|工单|倒卖|防止|梯子|tg|发布|重置/i;

  const originalProxies = config.proxies || [];
  const getProxyRatio = name => {
    const match = name.match(ratioRegex);
    const ratio = parseFloat(match?.[1] || match?.[2] || match?.[3]);
    return Number.isFinite(ratio) ? ratio : null;
  };
  const getLowRatioGroupName = regionName => `${regionName}低倍率`;

  const filteredProxies = originalProxies
    .filter(p => p?.name && !blackListRegex.test(p.name))
    .map(p => ({ ...p, __ratio: getProxyRatio(p.name) }))
    .filter(p => !(p.__ratio !== null && p.__ratio > 3.0));

  if (!filteredProxies.length && !originalProxies.length) return config;

  const proxiesWithNorm = filteredProxies.map(p => ({
    ...p,
    __normName: p.name.trim().replace(/\s+/g, '').replace(/[【】[\]（）()]/g, '').replace(/🇺🇸/g, 'US').replace(/🇯🇵/g, 'JP').replace(/🇸🇬/g, 'SG').replace(/🇭🇰/g, 'HK').replace(/🇹🇼/g, 'TW')
  }));

  const REGIONS = [
    { name: "美国", pattern: "美国|美|US|USA|UnitedStates|United States|纽约|NewYork|NYC|JFK|洛杉矶|LosAngeles|LAX|旧金山|SanFrancisco|SFO|圣何塞|SanJose|SJC|西雅图|Seattle|SEA|芝加哥|Chicago|ORD|达拉斯|Dallas|DFW|硅谷|SiliconValley", icon: "United_States.png" },
    { name: "日本", pattern: "日本|日|JP|JPN|Japan|东京|Tokyo|TYO|NRT|HND|大阪|Osaka|KIX", icon: "Japan.png" },
    { name: "香港", pattern: "香港|港|HK|HKG|HongKong|Hong Kong", icon: "Hong_Kong.png" },
    { name: "台湾", pattern: "台湾|台|TW|TWN|Taiwan|台北|Taipei|TPE|新北|NewTaipei", icon: "Taiwan.png" },
    { name: "新加坡", pattern: "新加坡|狮城|SG|SGP|Singapore|SIN", icon: "Singapore.png" }
  ];

  const activeRegions = REGIONS.map(region => {
    const regex = new RegExp(region.pattern.split('|').map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
    const matchedProxies = proxiesWithNorm.filter(p => regex.test(p.__normName));
    return {
      ...region,
      proxies: matchedProxies.map(p => p.name),
      lowRatioProxies: matchedProxies
        .filter(p => p.__ratio !== null && p.__ratio <= LOW_RATIO_THRESHOLD)
        .map(p => p.name)
    };
  }).filter(r => r.proxies.length > 0);

  const selectionNames = activeRegions.flatMap(region => {
    const names = [region.name];
    if (region.lowRatioProxies.length > 0) names.push(getLowRatioGroupName(region.name));
    return names;
  });

  const orderedRegionGroups = activeRegions.flatMap(region => {
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

  const proxyGroups = [
    { name: "节点选择", icon: `${ICON_BASE}Proxy.png`, type: "select", proxies: selectionNames },
    ...orderedRegionGroups,
    { name: "手动切换", icon: `${ICON_BASE}Available.png`, "include-all": true, type: "select" },
    { name: "GLOBAL", icon: `${ICON_BASE}Global.png`, type: "select", proxies: ["节点选择", ...selectionNames, "手动切换", "DIRECT"] }
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
      if (parts.length >= 3 && !validTargets.has(parts[2].trim())) parts[2] = "节点选择"; 
      return parts.join(',');
    });

  config["rules"] = [
    "RULE-SET,LocalAreaNetwork,DIRECT",
    "RULE-SET,UnBan,DIRECT",
    "RULE-SET,BanAD,REJECT",
    "RULE-SET,BanProgramAD,REJECT",
    ...customRules, 
    "RULE-SET,ProxyGFWlist,节点选择",
    "RULE-SET,ChinaDomain,DIRECT",
    "GEOIP,CN,DIRECT",
    "MATCH,节点选择"
  ];

  config.proxies = originalProxies;
  return config;
}
