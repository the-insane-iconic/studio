
"use client";

import { useState } from 'react';
import { suggestCertificateTemplate, SuggestCertificateTemplateOutput } from '@/ai/flows/suggest-certificate-template';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AiSuggestionProps {
  eventTitle: string;
  eventDescription: string;
}

export default function AiSuggestion({ eventTitle, eventDescription }: AiSuggestionProps) {
  const [suggestion, setSuggestion] = useState<SuggestCertificateTemplateOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    if (!eventTitle) {
      toast({
        title: "No Event Selected",
        description: "Please go back to Step 1 and select an event first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuggestion(null);

    try {
      const result = await suggestCertificateTemplate({ eventTitle, eventDescription });
      setSuggestion(result);
      toast({
        title: "AI Suggestion Ready!",
        description: "We've analyzed your event and have a recommendation.",
      });
    } catch (e: any) {
      toast({
        title: "AI Error",
        description: e.message || "Failed to get a suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleSuggest} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Get AI Suggestion
      </Button>

      {suggestion && (
        <Alert>
            <Wand2 className="h-4 w-4" />
          <AlertTitle>AI Recommendation: {suggestion.templateSuggestion}</AlertTitle>
          <AlertDescription>
            {suggestion.reasoning}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
