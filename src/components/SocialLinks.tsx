import { LINKS } from '../config';

export default function SocialLinks() {
  return (
    <div className="socials">
      <a className="slot slot--link slot--tg" href={LINKS.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram Лекса">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2l-4.7-1.5c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3Z"
          />
        </svg>
      </a>
      <a className="slot slot--link slot--tt" href={LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok Лекса">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.3 6.3 0 1 0 5.4 6.2V8.6a8 8 0 0 0 4.7 1.5V6.7a4.7 4.7 0 0 1-4.7-4.7Z"
          />
        </svg>
      </a>
    </div>
  );
}
