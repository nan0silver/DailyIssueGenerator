async function makeIssue() {
    const token = process.env.GH_TOKEN;
    const OWNER = "nan0silver"; 
    const REPO = "github_power_actions"; 

    // 1. 환율 데이터 가져오기 (Currency Layer)
    const currencyLayerApiKey = process.env.CURRENCY_LAYER_API_KEY; // 환경 변수에서 API 키 가져오기
    const exchangeRateResponse = await fetch(`http://api.currencylayer.com/live?access_key=${currencyLayerApiKey}&currencies=KRW&source=USD&format=1`);
    const exchangeRateData = await exchangeRateResponse.json();
    const exchangeRate = exchangeRateData.quotes.USDKRW.toFixed(2); // USD -> KRW 환율

    // 2. 명언 데이터 가져오기
    const quoteResponse = await fetch("https://api.adviceslip.com/advice");
    const quoteData = await quoteResponse.json();
    const quote = quoteData.slip.advice;

    // 3. 랜덤 이모지 선택
    const emojis = ["🎉", "🚀", "🍀", "✨", "🔥", "🤖", "💡", "🌈", "🦄"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    // 4. GitHub Issue 생성
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            title: "오늘의 정보", 
            body: `### 오늘의 정보

- **USD -> KRW 환율**: ${exchangeRate}원
- **오늘의 명언**: "${quote}"
- **오늘의 이모지**: ${randomEmoji}`
        })
    });

    if (response.ok) {
        console.log("성공");
    } else {
        console.log("실패", await response.text());
    }
}

makeIssue();
