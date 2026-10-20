(function (window) {
    var sections = [
        {
            id: 'preface',
            label: '序言',
            color: '#003596',
            articles: [
                { id: 'chairman-preface', title: '從「製造優勢」邁向「系統優勢」，臺灣迎向無人科技新世代', navLabel: '董事長序', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=140328896' },
                { id: 'president-preface', title: '從需求出發，開啟無人科技自主新局', navLabel: '院長序', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=137825881' },
                { id: 'vice-president-preface', title: '從「無人」走向「自主」： 打造臺灣下一波實體 AI 產業新優勢', navLabel: '蘇協理序', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=136119273' }
            ]
        },
        {
            id: 'chapter-1',
            label: '第一篇',
            subtitle: '未來情境與需求',
            color: '#0098c8',
            articles: [
                { id: 'unmanned-future', title: '無人科技重構未來基礎建設', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=137120596' },
                { id: 'unmanned-life-and-industry', title: '無人科技重塑未來生活與產業運作', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=140206447' },
                { id: 'autonomous-society', title: '全球無人科技科研趨勢與關鍵訊號', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=135058902' },
                { id: 'unmanned-technology-clusters', title: '全球無人化科技聚落與新創微觀賽道', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=134458534' },
                { id: 'unmanned-startup-cases', title: '社會視角下的無人科技新創案例', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=143013375' },
                { id: 'european-unmanned-systems', title: '無人系統優勢發展： 科研、監管與真實世界部署', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=141404826' }
            ]
        },
        {
            id: 'chapter-2',
            label: '第二篇',
            subtitle: '商用引爆點',
            color: '#ef5b16',
            articles: [
                { id: 'autonomous-healthcare', title: '無人科技開啟自主健康管理時代', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=141529081' },
                { id: 'land-air-logistics', title: '打造陸空無人物流異質整合生態系', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=139744497' },
                { id: 'unmanned-factory', title: '工業 5.0 時代無人工廠的人機新藍圖', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=139670199' },
                { id: 'energy-inspection', title: '能源資產探勘與無人巡檢新應用', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=140937792' },
                { id: 'environment-observation', title: '全球環境觀測體系重構與新供應鏈契機', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=136302838' },
                { id: 'autonomous-vehicle-safety', title: '高性能材料賦能無人載具自主安全', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=134938949' },
                { id: 'satellite-to-6g', title: '從多軌衛星整合到 6G 自主通訊，滿足城市通訊韌性需求', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=141054798' }
            ]
        },
        {
            id: 'chapter-3',
            label: '第三篇',
            subtitle: '自主化時代的全球競逐',
            color: '#00a879',
            articles: [
                { id: 'global-industry-trends', title: '國際無人科技產業發展現況與趨勢', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=136192512' },
                { id: 'trusted-global-standards', title: '打造可信標準與跨國新生態', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=142975159' },
                { id: 'european-turning-point', title: '歐洲無人科技迎來轉折點：民防雙軌推進與次世代無人化變革', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=136983189' },
                { id: 'human-machine-collaboration', title: '人機協作重塑勞動典範：打造化解缺工的 AI 與機器人整合架構', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=137161047' },
                { id: 'physical-ai', title: '從螢幕算力到實體世界：無人系統驅動的全球實體 AI 新賽局', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=138227499' }
            ]
        },
        {
            id: 'conclusion',
            label: '結論',
            subtitle: '台灣定位與國際合作',
            color: '#5f67ae',
            articles: [
                { id: 'taiwan-positioning', title: '無人科技時代下的臺灣定位與發展特色', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=142061094' },
                { id: 'taiwan-strategy', title: '臺灣無人科技的機會挑戰與國際合作策略', href: 'https://ieknet.iek.org.tw/iekrpt/rpt_open.aspx?rpt_idno=135168481' }
            ]
        }
    ];

    var articles = {};
    sections.forEach(function (section) {
        var entries = (section.articles || []).map(function (article) {
            return { article: article, category: '' };
        });
        (section.categories || []).forEach(function (category) {
            category.articles.forEach(function (article) {
                entries.push({ article: article, category: category.title });
            });
        });
        entries.forEach(function (entry) {
            var article = entry.article;
            articles[article.id] = {
                id: article.id,
                section: section.label,
                category: entry.category || article.category || '',
                title: article.title,
                author: 'IEKTopics 研究團隊',
                date: '2026/09/14',
                views: 0,
                downloads: 0,
                summary: '本頁為 IEKTopics 2026 示範文章介面，文章內容將依正式出版資料更新。',
                body: [
                    '本頁目前使用假資料呈現文章閱讀介面，提供標題、分類與內文排版的完整預覽。',
                    '未來接入正式內容後，將沿用相同的文章識別碼與版型，不需要修改導覽連結。',
                    '這段文字僅作為版面展示用途，實際文章內容、作者與出版資訊將由專案資料替換。'
                ]
            };
        });
    });

    window.IEKArticleData = {
        sections: sections,
        articles: articles
    };
}(window));
