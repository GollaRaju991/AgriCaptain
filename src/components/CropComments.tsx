import React, { useEffect, useState } from 'react';
import { MessageCircle, Send, Trash2, Loader2, User as UserIcon, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface CropComment {
  id: string;
  crop_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

interface CropCommentsProps {
  cropId: string;
}

const MAX_COMMENT_LENGTH = 500;

const CropComments: React.FC<CropCommentsProps> = ({ cropId }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [comments, setComments] = useState<CropComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const t = (en: string, te: string, hi?: string) => {
    if (language === 'te') return te;
    if (language === 'hi') return hi || en;
    return en;
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('crop_comments')
      .select('*')
      .eq('crop_id', cropId)
      .order('created_at', { ascending: false });
    setComments((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!cropId) return;
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
    load();
  }, [cropId]);

  const handlePost = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      toast({ title: t('Comment too long', 'వ్యాఖ్య చాలా పొడవు', 'टिप्पणी बहुत लंबी'), variant: 'destructive' });
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      toast({ title: t('Please login to comment', 'వ్యాఖ్యానించడానికి లాగిన్ అవ్వండి', 'टिप्पणी करने के लिए लॉगिन करें') });
      navigate('/auth');
      return;
    }

    setPosting(true);
    try {
      let userName = 'User';
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).maybeSingle();
      if (profile?.name) userName = profile.name;
      else if (user.user_metadata?.name) userName = user.user_metadata.name as string;

      const { error } = await supabase.from('crop_comments').insert({
        crop_id: cropId,
        user_id: user.id,
        user_name: userName,
        comment: trimmed,
      });
      if (error) throw error;
      setText('');
      await load();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('crop_comments').delete().eq('id', id);
      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('just now', 'ఇప్పుడే', 'अभी');
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString();
  };

  return (
    <Card className="mb-4 rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm font-bold text-foreground">
            {t('Comments', 'వ్యాఖ్యలు', 'टिप्पणियाँ')} ({comments.length})
          </p>
        </div>

        {/* Composer */}
        <div className="mb-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
            placeholder={t('Ask a question or share your thoughts...', 'ప్రశ్న అడగండి లేదా మీ ఆలోచనలను పంచుకోండి...', 'प्रश्न पूछें या अपने विचार साझा करें...')}
            className="min-h-[72px] resize-none text-sm"
            maxLength={MAX_COMMENT_LENGTH}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-muted-foreground">{text.length}/{MAX_COMMENT_LENGTH}</span>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePost}
              disabled={posting || !text.trim()}
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              {t('Post', 'పోస్ట్', 'पोस्ट')}
            </Button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            {t('No comments yet. Be the first to comment!', 'ఇంకా వ్యాఖ్యలు లేవు. మొదట వ్యాఖ్యానించండి!', 'अभी तक कोई टिप्पणी नहीं। पहले टिप्पणी करें!')}
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  {c.user_name?.[0]?.toUpperCase() || <UserIcon className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{c.user_name}</p>
                      <span className="text-[11px] text-muted-foreground">{formatTime(c.created_at)}</span>
                    </div>
                    {currentUserId === c.user_id && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropComments;
