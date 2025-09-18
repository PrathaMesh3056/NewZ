import os
import requests
import base64
from dotenv import load_dotenv

# Load API key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0:generateImage?key={api_key}"

prompt = "A cyberpunk city with glowing neon lights and flying cars."

print("⏳ Generating image...")

resp = requests.post(url, json={"prompt": {"text": prompt}})
data = resp.json()

if "error" in data:
    print("❌ Error:", data["error"])
else:
    for i, img in enumerate(data["images"]):
        img_bytes = base64.b64decode(img["imageBytes"])
        filename = f"gemini_rest_output_{i}.png"
        with open(filename, "wb") as f:
            f.write(img_bytes)
        print(f"✅ Saved: {filename}")
import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";

export class Newsitem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: null,
      isSummarizing: false,
    };
  }

  handleSummarize = () => {
    const { title, description, imageUrl, newsUrl, author, date, source } = this.props;

    // Redirect immediately to /ai-summary - let AiSummary handle the loading
    this.setState({
      isSummarizing: true,
      redirect: {
        pathname: "/ai-summary",
        state: {
          title,
          description,
          imageUrl,
          author,
          date,
          source,
          newsUrl,
          shouldSummarize: true // Flag to trigger summary generation in AiSummary
        }
      }
    });
  };

  formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  render() {
    let { title, description, imageUrl, newsUrl, author, date, source, category } = this.props;
    const { redirect } = this.state;

    // Redirect if summarization is done
    if (redirect) {
      return <Navigate to={redirect.pathname} state={redirect.state} />;
    }

    return (
      <div className="group h-full flex">
        <article className="flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden ring-1 ring-gray-100 hover:ring-gray-200 hover:shadow-lg transition duration-300 will-change-transform hover:-translate-y-0.5 h-full w-full">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            {imageUrl ? (
              <img
                src={imageUrl}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt={`${title} — from ${source || "Unknown source"} (${category || "General"})`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="w-32 h-32 p-3 flex items-center justify-center">
                  <img 
                    src="/Newz_logo.png" 
                    alt="Newz Logo" 
                    className="max-w-full max-h-full object-contain drop-shadow-sm"
                  />
                </div>
                <span className="text-base font-medium text-gray-500 dark:text-gray-400 mt-1">Newz</span>
              </div>
            )}
            <div className="hidden absolute inset-0 flex-col items-center justify-center p-4 text-center bg-white/90 dark:bg-gray-900/90">
              <div className="w-32 h-32 p-3 flex items-center justify-center">
                <img 
                  src="/Newz_logo.png" 
                  alt="Newz Logo" 
                  className="max-w-full max-h-full object-contain drop-shadow-sm"
                />
              </div>
              <span className="text-base font-medium text-gray-500 dark:text-gray-300 mt-1">Newz</span>
            </div>
            <div className="absolute top-3 right-3">
              <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-md">
                {source}
              </span>
            </div>
            {category && (
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 dark:bg-gray-900/80 backdrop-blur text-gray-800 dark:text-gray-100 text-xs font-medium px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                  #{category}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col h-full">
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
                {title}
              </h3>

              {description ? (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-3 overflow-hidden text-ellipsis h-[4.5rem] leading-snug">
                  {description}
                </p>
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-sm mb-2 italic h-[4.5rem] flex items-center">
                  <span className="border-l-2 border-gray-300 dark:border-gray-600 pl-2">
                    No description available. Click 'Read full article' to learn more.
                  </span>
                </div>
              )}

              {/* Meta */}
              <div className="mt-auto">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="truncate max-w-[50%]">👤 {author || "Unknown"}</span>
                  <span className="whitespace-nowrap ml-2">📅 {this.formatDate(date)}</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <a
                    href={newsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center h-8 text-red-600 hover:underline text-sm"
                  >
                    Read full article →
                  </a>

                  <button
                    onClick={this.handleSummarize}
                    disabled={this.state.isSummarizing}
                    aria-busy={this.state.isSummarizing}
                    title={this.state.isSummarizing ? "Preparing summary..." : "Generate AI summary"}
                    className={`inline-flex items-center h-8 px-3 text-sm font-medium gap-2 rounded-md border transition duration-200 shadow-sm ${
                      this.state.isSummarizing
                        ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                        : "text-blue-700 bg-blue-50 border-blue-200 hover:border-blue-300 hover:bg-blue-100 hover:-translate-y-0.5 hover:shadow"
                    }`}
                  >
                    {this.state.isSummarizing && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    )}
                    {this.state.isSummarizing ? "Summarizing..." : "AI Summarize"}
                  </button>
                </div>

                {/* Share buttons */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(() => {
                    const text = encodeURIComponent(`${title} — ${source || "NewZ"}`);
                    const url = encodeURIComponent(newsUrl || "");
                    return (
                      <>
                        <a
                          href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-500 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-100"
                          aria-label="Share on X"
                          title="Share on X"
                        >
                          <span>
                            <svg class="transition-all duration-300 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 72 72" fill="none">
                              <path d="M40.7568 32.1716L59.3704 11H54.9596L38.7974 29.383L25.8887 11H11L30.5205 38.7983L11 61H15.4111L32.4788 41.5869L46.1113 61H61L40.7557 32.1716H40.7568ZM34.7152 39.0433L32.7374 36.2752L17.0005 14.2492H23.7756L36.4755 32.0249L38.4533 34.7929L54.9617 57.8986H48.1865L34.7152 39.0443V39.0433Z" fill="black" />
                            </svg>
                          </span> Share
                        </a>
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-indigo-800 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          aria-label="Share on LinkedIn"
                          title="Share on LinkedIn"
                        >
                          <span> 
                            <svg class="rounded-md transition-all duration-300 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 72 72" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.6975 11C12.6561 11 11 12.6057 11 14.5838V57.4474C11 59.4257 12.6563 61.03 14.6975 61.03H57.3325C59.3747 61.03 61.03 59.4255 61.03 57.4468V14.5838C61.03 12.6057 59.3747 11 57.3325 11H14.6975ZM26.2032 30.345V52.8686H18.7167V30.345H26.2032ZM26.6967 23.3793C26.6967 25.5407 25.0717 27.2703 22.4615 27.2703L22.4609 27.2701H22.4124C19.8998 27.2701 18.2754 25.5405 18.2754 23.3791C18.2754 21.1686 19.9489 19.4873 22.5111 19.4873C25.0717 19.4873 26.6478 21.1686 26.6967 23.3793ZM37.833 52.8686H30.3471L30.3469 52.8694C30.3469 52.8694 30.4452 32.4588 30.3475 30.3458H37.8336V33.5339C38.8288 31.9995 40.6098 29.8169 44.5808 29.8169C49.5062 29.8169 53.1991 33.0363 53.1991 39.9543V52.8686H45.7133V40.8204C45.7133 37.7922 44.6293 35.7269 41.921 35.7269C39.8524 35.7269 38.6206 37.1198 38.0796 38.4653C37.8819 38.9455 37.833 39.6195 37.833 40.2918V52.8686Z" fill="#006699" />
                          </svg></span> Share
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?text=${text}%20${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-green-500 dark:border-gray-700 text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          aria-label="Share on WhatsApp"
                          title="Share on WhatsApp"
                        >
                          <span >
                            <svg class="transition-all duration-300 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 71 72" fill="none">
                              <path d="M12.5762 56.8405L15.8608 44.6381C13.2118 39.8847 12.3702 34.3378 13.4904 29.0154C14.6106 23.693 17.6176 18.952 21.9594 15.6624C26.3012 12.3729 31.6867 10.7554 37.1276 11.1068C42.5685 11.4582 47.6999 13.755 51.5802 17.5756C55.4604 21.3962 57.8292 26.4844 58.2519 31.9065C58.6746 37.3286 57.1228 42.7208 53.8813 47.0938C50.6399 51.4668 45.9261 54.5271 40.605 55.7133C35.284 56.8994 29.7125 56.1318 24.9131 53.5513L12.5762 56.8405ZM25.508 48.985L26.2709 49.4365C29.7473 51.4918 33.8076 52.3423 37.8191 51.8555C41.8306 51.3687 45.5681 49.5719 48.4489 46.7452C51.3298 43.9185 53.1923 40.2206 53.7463 36.2279C54.3002 32.2351 53.5143 28.1717 51.5113 24.6709C49.5082 21.1701 46.4003 18.4285 42.6721 16.8734C38.9438 15.3184 34.8045 15.0372 30.8993 16.0736C26.994 17.11 23.5422 19.4059 21.0817 22.6035C18.6212 25.801 17.2903 29.7206 17.2963 33.7514C17.293 37.0937 18.2197 40.3712 19.9732 43.2192L20.4516 44.0061L18.6153 50.8167L25.508 48.985Z" fill="#00D95F" />
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M44.0259 36.8847C43.5787 36.5249 43.0549 36.2716 42.4947 36.1442C41.9344 36.0168 41.3524 36.0186 40.793 36.1495C39.9524 36.4977 39.4093 37.8134 38.8661 38.4713C38.7516 38.629 38.5833 38.7396 38.3928 38.7823C38.2024 38.8251 38.0028 38.797 37.8316 38.7034C34.7543 37.5012 32.1748 35.2965 30.5122 32.4475C30.3704 32.2697 30.3033 32.044 30.325 31.8178C30.3467 31.5916 30.4555 31.3827 30.6286 31.235C31.2344 30.6368 31.6791 29.8959 31.9218 29.0809C31.9756 28.1818 31.7691 27.2863 31.3269 26.5011C30.985 25.4002 30.3344 24.42 29.4518 23.6762C28.9966 23.472 28.4919 23.4036 27.9985 23.4791C27.5052 23.5546 27.0443 23.7709 26.6715 24.1019C26.0242 24.6589 25.5104 25.3537 25.168 26.135C24.8256 26.9163 24.6632 27.7643 24.6929 28.6165C24.6949 29.0951 24.7557 29.5716 24.8739 30.0354C25.1742 31.1497 25.636 32.2144 26.2447 33.1956C26.6839 33.9473 27.163 34.6749 27.6801 35.3755C29.3607 37.6767 31.4732 39.6305 33.9003 41.1284C35.1183 41.8897 36.42 42.5086 37.7799 42.973C39.1924 43.6117 40.752 43.8568 42.2931 43.6824C43.1711 43.5499 44.003 43.2041 44.7156 42.6755C45.4281 42.1469 45.9995 41.4518 46.3795 40.6512C46.6028 40.1675 46.6705 39.6269 46.5735 39.1033C46.3407 38.0327 44.9053 37.4007 44.0259 36.8847Z" fill="#00D95F" />
                            </svg></span> Share
                        </a>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }
}

export default Newsitem;
