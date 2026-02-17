export async function updateChallengeStatus(
  id: string,
  action: 'accept' | 'reject',
  selection?: string,
) {
  const res = await fetch('/api/challenge', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action, acceptorSelection: selection }),
  });
  return res.json();
}
// Utilidad para interactuar con el backend de retos directos

export type Challenge = {
  id: string;
  fromUser: string;
  toUserCode: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  eventName?: string;
  league?: string;
  selection?: string;
};

export async function createChallenge({
  fromUser,
  toUserCode,
  amount,
  message,
}: {
  fromUser: string;
  toUserCode: string;
  amount: number;
  message?: string;
}) {
  const res = await fetch('/api/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromUser, toUserCode, amount, message }),
  });
  return res.json();
}

export async function getReceivedChallenges(
  userCode: string,
): Promise<{ challenges: Challenge[] }> {
  const res = await fetch(
    `/api/challenge?userCode=${encodeURIComponent(userCode)}`,
  );
  return res.json();
}
