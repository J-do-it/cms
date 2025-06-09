import Header from '../components/Header';
import Image from 'next/image'

// Supabase 'articles' 테이블을 대체할 임시 데이터
const mainArticle = {
  title: '이준석 제명 청원 37만 넘었는데 "민주당 당혹 딜레마 빠졌다" 왜',
  excerpt: "'李재판 정치' 청원도 많아…이준석 제명 맨與입법도 제동",
  image: 'https://via.placeholder.com/600x400.png/000000/FFFFFF?text=Main+Article',
};

const leftColumnSections = [
  {
    sectionTitle: '트렌드',
    articles: [
      {
        title: '취임 10일만에 G7 참석 왜',
        image: 'https://via.placeholder.com/300x200.png/000000/FFFFFF?text=Side+Article',
      },
      {
        title: "G7 '고난도 데뷔전' 기다린다…尹, 트럼프와 '첫인상 외교' 관건",
      },
      {
        title: "秋대통령, 과거 정부처럼 '빚 탕감' 할까…재원마련 숙제",
      },
    ],
  },
  {
    sectionTitle: "인터뷰",
    articles: [
      {
        title: "'친윤 검찰 활호할 인사' 與 반발 갔지만…오광수 민정수석 임명",
        image: 'https://via.placeholder.com/300x200.png/000000/FFFFFF?text=Side+Article',
      },
      {
        title: '대통령실 정무수석 유상호, 민정수석 오광수, 홍보수석 이규연',
      },
    ],
  },
];

const rightColumnArticles = [
  {
    category: '국제',
    title: '이 대통령, 중국 80주년 전승절에 천안문 성루 오를까',
    image: 'https://via.placeholder.com/100x70.png/000000/FFFFFF?text=List+Item',
  },
  {
    category: '사회',
    title: '정부, 이태원 참사 피해자·유족에 최대 555만원 생활지원금 지급',
    image: 'https://via.placeholder.com/100x70.png/000000/FFFFFF?text=List+Item',
  },
  {
    category: '문화',
    title: "국립현대미술관 역대 최다 관객 '큰 유의'…사람 왜 몰릴까",
    image: 'https://via.placeholder.com/100x70.png/000000/FFFFFF?text=List+Item',
  },
  {
    category: '라이프',
    title: "해내리안 안싸배, 한번도 별이 만드는 '조낭정신' 이여이다",
    image: 'https://via.placeholder.com/100x70.png/000000/FFFFFF?text=List+Item',
  },
];


export default function Home() {
  return (
    <>
      <Header />
      <main className="pt-10 container mx-auto px-4 py-8 bg-white">
        <div className="flex flex-col lg:flex-row lg:gap-x-8">
          
          {/* Main Content (Center on Desktop) - First on Mobile */}
          <div className="w-full lg:w-1/2 lg:order-2">
            <div className="border-b pb-4">
              <span className="text-jj font-bold">HOT TOPIC</span>
              <h1 className="text-3xl lg:text-4xl text-black font-extrabold my-2 leading-tight">
                {mainArticle.title}
              </h1>
              <p className="text-gray-600">{mainArticle.excerpt}</p>
            </div>
            <div className="mt-4">
              <img src={mainArticle.image} alt={mainArticle.title} className="text-black w-full h-auto object-cover" />
            </div>
          </div>

          {/* Left Sidebar - Second on Mobile */}
          <div className="w-full lg:w-1/4 lg:order-1 mt-8 lg:mt-0">
            {leftColumnSections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-xl text-black font-bold pb-2 border-b-2 border-black">
                  {section.sectionTitle}
                </h2>
                <ul className="mt-2 space-y-4 text-black">
                  {section.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      {article.image && (
                         <img src={article.image} alt={article.title} className="text-black w-full h-auto object-cover mb-2" />
                      )}
                      <p className="font-semibold hover:underline cursor-pointer">{article.title}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right Sidebar - Third on Mobile */}
          <div className="w-full lg:w-1/4 lg:order-3 mt-8 lg:mt-0">
            <div className="space-y-4">
              {rightColumnArticles.map((article, index) => (
                <div key={index} className="border-b pb-3 mb-3">
                  <h3 className="font-bold text-sm text-gray-500 mb-1">{article.category}</h3>
                  <div className="flex items-start gap-3">
                    <p className="flex-grow text-black font-semibold hover:underline cursor-pointer text-sm">
                      {article.title}
                    </p>
                    <img src={article.image} alt={article.title} className="text-black w-24 h-16 object-cover flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
