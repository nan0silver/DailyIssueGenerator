async function makeIssue() {
  const token = process.env.GH_TOKEN;
  const OWNER = "nan0silver"; 
  const REPO = "github_power_actions"; 

  // 1. 환율 데이터 가져오기 (Currency Layer)
  const currencyLayerApiKey = process.env.CURRENCY_LAYER_API_KEY;
  const exchangeRateResponse = await fetch(`http://api.currencylayer.com/live?access_key=${currencyLayerApiKey}&currencies=KRW&source=USD&format=1`);
  const exchangeRateData = await exchangeRateResponse.json();
  const exchangeRate = exchangeRateData.quotes.USDKRW.toFixed(2);

  // 2. 주식 관련 뉴스 데이터 가져오기 (NewsAPI)
  const newsApiKey = process.env.NEWS_API_KEY;
  const stockNewsResponse = await fetch(`https://newsapi.org/v2/everything?q=stock&language=ko&sortBy=publishedAt&pageSize=3&apiKey=${newsApiKey}`);
  const stockNewsData = await stockNewsResponse.json();
  let stockNewsList = '';
  if (stockNewsData.articles && stockNewsData.articles.length > 0) {
    stockNewsList = stockNewsData.articles.map((article, index) => {
      return `${index + 1}. [${article.title}](${article.url}) - ${article.source.name}`;
    }).join("\n");
  } else {
    stockNewsList = "주식 관련 뉴스가 없습니다.";
  }

  // 3. 날씨 정보 가져오기 (OpenWeatherMap)
  const weatherApiKey = process.env.OPENWEATHER_API_KEY;
  const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${weatherApiKey}&units=metric&lang=kr`);
  const weatherData = await weatherResponse.json();

  let temperature = "데이터 없음";
  let weatherDescription = "데이터 없음";
  let weatherIcon = "";

  // weatherData가 예상한 형식인지 체크
  if (weatherData && weatherData.main && weatherData.weather && weatherData.weather[0]) {
    temperature = weatherData.main.temp.toFixed(1);
    weatherDescription = weatherData.weather[0].description;
    weatherIcon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
  } else {
    console.error("OpenWeatherMap API 오류:", weatherData);
  }

  // 4. GitHub Issue 생성
  const issueBody = `
### 💵 오늘의 환율 정보

- **USD -> KRW 환율**: ${exchangeRate}원

#### 📈 주식 관련 뉴스
${stockNewsList}

#### ☀️ 서울 날씨 정보
- **온도**: ${temperature}°C
- **날씨**: ${weatherDescription}
${weatherIcon ? `![날씨 아이콘](${weatherIcon})` : ''}
  `;

  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: "오늘의 정보", 
      body: issueBody
    })
  });

  if (response.ok) {
    console.log("Issue 생성 성공");
  } else {
    console.log("Issue 생성 실패", await response.text());
  }
}

makeIssue();
