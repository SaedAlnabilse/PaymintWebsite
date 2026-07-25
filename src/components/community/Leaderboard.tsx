import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { communityApi } from '../../services/communityApi';

type LeaderEntry = {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  reputation: number;
  trustLevel: string;
};

export function Leaderboard({ limit = 5 }: { limit?: number }) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await communityApi.getLeaderboard(limit);
        if (!cancelled) setEntries(data);
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (entries.length === 0) return null;

  return (
    <div>
      <p className="mb-2.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-text-tertiary">
        {t('community.leaderboard.title', { defaultValue: 'Top contributors' })}
      </p>
      <div className="space-y-0.5">
        {entries.map((e) => (
          <Link
            key={e.id}
            to={`/community/u/${e.username}`}
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-black/[0.03] transition-colors"
          >
            <span className="w-4 text-[11px] font-semibold text-text-tertiary tabular-nums text-center">
              {e.rank}
            </span>
            {e.avatar ? (
              <img src={e.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-[#7dc6a2]/20 flex items-center justify-center text-[11px] font-bold text-[#3d7a5c]">
                {e.displayName.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-text-primary truncate" dir="auto">
                {e.displayName}
              </p>
              <p className="text-[11px] text-text-tertiary">
                {e.reputation} pts · {e.trustLevel}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
