
import { Star, Quote, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
const testimonials = [
  {
    name: "Priya Sharma",
    role: "College Student",
    avatar: "https://i.pravatar.cc/100?img=32",
    rating: 5,
    text: "SpeakUp helped me crack my campus interview. The AI feedback on my pronunciation was spot on!",
  },
  {
    name: "Arun Kumar",
    role: "Software Engineer",
    avatar: "https://i.pravatar.cc/100?img=12",
    rating: 5,
    text: "I practice every day during my commute. My confidence in client calls has improved so much.",
  },
  {
    name: "Divya Raj",
    role: "Marketing Executive",
    avatar: "https://i.pravatar.cc/100?img=47",
    rating: 4,
    text: "Free forever and no ads — I was skeptical at first, but the quality is genuinely better than paid apps.",
  },
  {
    name: "Mohammed Farhan",
    role: "Freelancer",
    avatar: "https://i.pravatar.cc/100?img=51",
    rating: 5,
    text: "The instant feedback feature is a game changer. It's like having a personal English tutor 24/7.",
  },
];

export default function Testimonials() {
  const navigate = useNavigate();
  return (
    <section className="bg-[#0b0f0e] py-20 px-6">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <span className="inline-block bg-emerald-500/10 text-emerald-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          ⭐ Loved by 50K+ Learners
        </span>
        <h2
  className="text-4xl md:text-5xl font-extrabold text-white cursor-pointer inline-flex items-center gap-3 group"
  onClick={() => navigate('/reviews')}
>
  What Our{" "}
  <span className="bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
    Learners Say
  </span>
  <ArrowRight className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
</h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Real stories from real people who transformed their spoken English with SpeakUp.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-[#141a18] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-colors"
          >
            <Quote className="text-emerald-500/40 w-8 h-8 mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {t.text}
            </p>
            <div>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={16}
                    className={
                      idx < t.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-700 text-gray-700"
                    }
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}