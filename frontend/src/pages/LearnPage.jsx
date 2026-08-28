import { useParams, useNavigate } from 'react-router-dom';
import learningContent from '../data/learningContent.js';
import "../homepage.css";
import BottomNav from '../components/BottomNav.jsx';

export default function LearnPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const goBackToCategories = () => {
    navigate('/');
    setTimeout(() => {
      document.getElementById('learning-categories')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const content = learningContent[slug];

  if (!content) {
    return (
      <div className="learn-page">
        <div className="learn-card">
          <p>We couldn't find that category.</p>
          <button className="btn-secondary" onClick={goBackToCategories}>Back to Categories</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const goPractice = () => {
    if (content.mode === 'call') {
      navigate(`/call/${slug}`);
    } else {
      navigate(`/text/${slug}`);
    }
  };

  return (
    <div className="learn-page">
      <div className="learn-card">
        <button className="challenge-back" onClick={goBackToCategories}>← Back to Categories</button>
        <div className="learn-header">
          <h2>{content.heading}</h2>
          <p>{content.subheading}</p>
        </div>
        <div className="learn-items">
          {content.items.map((item, i) => (
            <div className="learn-item" key={i}>
              <div className="learn-item-num">{i + 1}</div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-primary learn-practice-btn" onClick={goPractice}>
          {content.mode === 'call' ? 'Start Speaking Practice →' : 'Start Practice →'}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}