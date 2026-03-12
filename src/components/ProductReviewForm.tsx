import React, { useState } from 'react';
import { Star, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  notHelpful: number;
}

interface ProductReviewFormProps {
  productId: string;
  onReviewSubmit: (review: Review) => void;
}

const ProductReviewForm: React.FC<ProductReviewFormProps> = ({ productId, onReviewSubmit }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const label = (en: string, te: string) => language === 'te' ? te : en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: label('Please select a rating', 'దయచేసి రేటింగ్ ఎంచుకోండి'), variant: 'destructive' });
      return;
    }
    if (!comment.trim()) {
      toast({ title: label('Please write a review', 'దయచేసి సమీక్ష రాయండి'), variant: 'destructive' });
      return;
    }

    const newReview: Review = {
      id: Date.now(),
      name: name.trim() || label('Anonymous User', 'అనామక వినియోగదారు'),
      rating,
      date: 'Just now',
      comment: comment.trim(),
      helpful: 0,
      notHelpful: 0,
    };

    onReviewSubmit(newReview);
    setRating(0);
    setTitle('');
    setComment('');
    setName('');
    setIsExpanded(false);
    toast({ title: label('Review submitted successfully!', 'సమీక్ష విజయవంతంగా సమర్పించబడింది!') });
  };

  const ratingLabels = ['', 'Very Bad', 'Bad', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
      >
        <span className="font-semibold text-foreground">
          {label('Rate & Review Product', 'ఉత్పత్తిని రేట్ & సమీక్షించండి')}
        </span>
        <span className="text-sm text-primary font-medium">
          {isExpanded ? label('Close', 'మూసివేయి') : label('Write Review', 'సమీక్ష రాయండి')}
        </span>
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-card">
          {/* Star Rating */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              {label('Overall Rating', 'మొత్తం రేటింగ్')} *
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {(hoverRating || rating) > 0 && (
                <span className="ml-2 text-sm text-muted-foreground font-medium">
                  {ratingLabels[hoverRating || rating]}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              {label('Your Name', 'మీ పేరు')}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={label('Enter your name (optional)', 'మీ పేరు నమోదు చేయండి (ఐచ్ఛికం)')}
              className="bg-muted/30"
            />
          </div>

          {/* Review Title */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              {label('Review Title', 'సమీక్ష శీర్షిక')}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={label('Summarize your experience', 'మీ అనుభవాన్ని సంక్షిప్తంగా చెప్పండి')}
              className="bg-muted/30"
            />
          </div>

          {/* Review Comment */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              {label('Your Review', 'మీ సమీక్ష')} *
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={label('Tell us what you liked or disliked about this product...', 'ఈ ఉత్పత్తి గురించి మీకు ఏమి నచ్చింది లేదా నచ్చలేదో మాకు చెప్పండి...')}
              rows={4}
              className="bg-muted/30 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white flex-1">
              {label('Submit Review', 'సమీక్ష సమర్పించండి')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsExpanded(false)}>
              {label('Cancel', 'రద్దు')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductReviewForm;
