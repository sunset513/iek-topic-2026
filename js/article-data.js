(function (window) {
    var sections = [
        {
            id: 'preface',
            label: '序言',
            color: '#003596',
            articles: [
                { id: 'chairman-preface', title: '董事長序' },
                { id: 'president-preface', title: '院長序' },
                { id: 'vice-president-preface', title: '蘇協理序' }
            ]
        },
        {
            id: 'chapter-1',
            label: '第一篇',
            subtitle: '未來情境與需求篇',
            color: '#0098c8',
            articles: [
                { id: 'unmanned-future', title: '前言：無人科技大未來' },
                { id: 'unmanned-life-and-industry', title: '無人科技重塑未來生活與產業運作' },
                { id: 'autonomous-society', title: '自主化社會：全球無人科技研發趨勢與關鍵訊號' },
                { id: 'unmanned-technology-clusters', title: '全球無人化科技聚落與新創微觀賽道' },
                { id: 'unmanned-startup-cases', title: '社會視角下的無人科技新創案例' },
                { id: 'european-unmanned-systems', title: '歐洲無人系統優勢發展：科研、監管與真實世界部署' }
            ]
        },
        {
            id: 'chapter-2',
            label: '第二篇',
            subtitle: '從單點技術突破走向多元場域落地',
            color: '#ef5b16',
            categories: [
                {
                    title: '民生服務',
                    articles: [
                        { id: 'autonomous-healthcare', title: '無人科技開啟自主健康管理時代' },
                        { id: 'land-air-logistics', title: '打造陸空無人物流異質整合生態系' }
                    ]
                },
                {
                    title: '產業升級與永續發展',
                    articles: [
                        { id: 'unmanned-factory', title: '工業 5.0 時代無人工廠的人機新藍圖' },
                        { id: 'energy-inspection', title: '能源資產探勘與無人巡檢新應用' },
                        { id: 'environment-observation', title: '全球環境觀測體系重構與臺灣供應鏈契機' },
                        { id: 'autonomous-vehicle-safety', title: '高性能材料賦能無人載具自主安全' }
                    ]
                },
                {
                    title: '安全治理',
                    articles: [
                        { id: 'satellite-to-6g', title: '從多軌衛星整合到 6G 自主通訊的戰略布局' }
                    ]
                }
            ]
        },
        {
            id: 'chapter-3',
            label: '第三篇',
            subtitle: '國際無人社會的生態發展',
            color: '#00a879',
            articles: [
                { id: 'global-industry-trends', title: '國際無人科技產業發展現況與趨勢' },
                { id: 'trusted-global-standards', title: '無人科技翻轉全球社會：打造可信標準與跨國新生態' },
                { id: 'european-turning-point', title: '歐洲無人科技迎來轉折點：民防雙軌推進與次世代無人化變革' },
                { id: 'human-machine-collaboration', title: '人機協同重塑勞動典範：打造化解缺工危機的 AI 與機器人整合架構' },
                { id: 'physical-ai', title: '從螢幕算力到實體世界：無人系統驅動的全球實體 AI 新賽局' }
            ]
        },
        {
            id: 'conclusion',
            label: '結論',
            subtitle: '從供應鏈到生態系角色',
            color: '#5f67ae',
            articles: [
                { id: 'taiwan-positioning', title: '無人科技時代下的台灣定位與發展特色' },
                { id: 'taiwan-strategy', title: '從台灣的機會與挑戰探討無人科技發展策略' }
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
