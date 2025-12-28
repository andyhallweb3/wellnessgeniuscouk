import { useState } from "react";
import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { MessageCircle, Clock, Pause, ArrowRight, Plus, Pencil, Trash2, X, Check, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";

type PartnershipStatus = 'active' | 'dormant' | 'paused';

interface Partnership {
  id: string;
  name: string;
  type: string;
  status: PartnershipStatus;
  last_contact: string | null;
  fit_score: number;
  next_move: string | null;
  insight: string | null;
  user_id: string;
}

interface ContactLog {
  id: string;
  partnership_id: string;
  notes: string | null;
  contacted_at: string;
}

interface PartnershipForm {
  name: string;
  type: string;
  status: PartnershipStatus;
  fit_score: number;
  next_move: string;
  insight: string;
}

const defaultForm: PartnershipForm = {
  name: '',
  type: '',
  status: 'active',
  fit_score: 50,
  next_move: '',
  insight: ''
};

export default function Partnerships() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PartnershipForm>(defaultForm);
  const [loggingContactId, setLoggingContactId] = useState<string | null>(null);
  const [contactNote, setContactNote] = useState('');
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const { data: partnerships = [], isLoading } = useQuery({
    queryKey: ['founder-partnerships', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founder_partnerships')
        .select('*')
        .order('status', { ascending: true })
        .order('fit_score', { ascending: false });
      
      if (error) throw error;
      return data as Partnership[];
    },
    enabled: !!user
  });

  const { data: contactLogs = [] } = useQuery({
    queryKey: ['founder-partnership-contacts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founder_partnership_contacts')
        .select('*')
        .order('contacted_at', { ascending: false });
      
      if (error) throw error;
      return data as ContactLog[];
    },
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: async (newPartnership: PartnershipForm) => {
      const { error } = await supabase
        .from('founder_partnerships')
        .insert({
          ...newPartnership,
          user_id: user!.id,
          last_contact: new Date().toISOString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['founder-partnerships'] });
      setIsAdding(false);
      setForm(defaultForm);
      toast.success('Partnership added');
    },
    onError: () => toast.error('Failed to add partnership')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: PartnershipForm & { id: string }) => {
      const { error } = await supabase
        .from('founder_partnerships')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['founder-partnerships'] });
      setEditingId(null);
      setForm(defaultForm);
      toast.success('Partnership updated');
    },
    onError: () => toast.error('Failed to update partnership')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('founder_partnerships')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['founder-partnerships'] });
      toast.success('Partnership removed');
    },
    onError: () => toast.error('Failed to remove partnership')
  });

  const logContactMutation = useMutation({
    mutationFn: async ({ partnershipId, notes }: { partnershipId: string; notes: string }) => {
      // Insert contact log
      const { error: contactError } = await supabase
        .from('founder_partnership_contacts')
        .insert({
          partnership_id: partnershipId,
          user_id: user!.id,
          notes: notes || null
        });
      if (contactError) throw contactError;

      // Update last_contact on partnership
      const { error: updateError } = await supabase
        .from('founder_partnerships')
        .update({ last_contact: new Date().toISOString() })
        .eq('id', partnershipId);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['founder-partnerships'] });
      queryClient.invalidateQueries({ queryKey: ['founder-partnership-contacts'] });
      setLoggingContactId(null);
      setContactNote('');
      toast.success('Contact logged');
    },
    onError: () => toast.error('Failed to log contact')
  });

  const startEdit = (partnership: Partnership) => {
    setEditingId(partnership.id);
    setForm({
      name: partnership.name,
      type: partnership.type,
      status: partnership.status,
      fit_score: partnership.fit_score,
      next_move: partnership.next_move || '',
      insight: partnership.insight || ''
    });
  };

  const getContactsForPartnership = (partnershipId: string) => 
    contactLogs.filter(log => log.partnership_id === partnershipId);

  const StatusIcon = ({ status }: { status: PartnershipStatus }) => {
    switch (status) {
      case 'active':
        return <MessageCircle className="h-4 w-4 text-accent" />;
      case 'dormant':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const FitScoreBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{score}</span>
    </div>
  );

  const statusCounts = {
    active: partnerships.filter(p => p.status === 'active').length,
    dormant: partnerships.filter(p => p.status === 'dormant').length,
    paused: partnerships.filter(p => p.status === 'paused').length
  };

  return (
    <FounderLayout>
      <Helmet>
        <title>Partnerships | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Partnerships</h1>
          <p className="text-muted-foreground mt-1">
            Strategic relationships as leverage
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => { setIsAdding(true); setForm(defaultForm); }}
          disabled={isAdding}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="founder-card text-center">
          <p className="founder-stat">{statusCounts.active}</p>
          <p className="founder-stat-label">Active</p>
        </div>
        <div className="founder-card text-center">
          <p className="founder-stat">{statusCounts.dormant}</p>
          <p className="founder-stat-label">Dormant</p>
        </div>
        <div className="founder-card text-center">
          <p className="founder-stat">{statusCounts.paused}</p>
          <p className="founder-stat-label">Paused</p>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="founder-card mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">New Partnership</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input 
              placeholder="Partner name" 
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <Input 
              placeholder="Type (e.g. Integration partner)" 
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.status} onValueChange={(v: PartnershipStatus) => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="number" 
              min={0} 
              max={100} 
              placeholder="Fit score (0-100)" 
              value={form.fit_score}
              onChange={e => setForm({ ...form, fit_score: parseInt(e.target.value) || 0 })}
            />
          </div>
          <Input 
            placeholder="Next move" 
            value={form.next_move}
            onChange={e => setForm({ ...form, next_move: e.target.value })}
          />
          <Textarea 
            placeholder="Strategic insight" 
            value={form.insight}
            onChange={e => setForm({ ...form, insight: e.target.value })}
            rows={2}
          />
          <Button 
            size="sm" 
            onClick={() => createMutation.mutate(form)}
            disabled={!form.name || !form.type || createMutation.isPending}
          >
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && partnerships.length === 0 && !isAdding && (
        <div className="founder-card text-center py-8">
          <p className="text-muted-foreground mb-3">No partnerships tracked yet</p>
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add your first partnership
          </Button>
        </div>
      )}

      {/* Partnerships List */}
      <div className="space-y-4">
        {partnerships.map((partnership) => {
          const partnershipContacts = getContactsForPartnership(partnership.id);
          const isExpanded = expandedHistoryId === partnership.id;
          
          return (
            <div key={partnership.id} className="founder-card">
              {editingId === partnership.id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Edit Partnership</h3>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="Partner name" 
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                    <Input 
                      placeholder="Type" 
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={form.status} onValueChange={(v: PartnershipStatus) => setForm({ ...form, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="dormant">Dormant</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      type="number" 
                      min={0} 
                      max={100} 
                      value={form.fit_score}
                      onChange={e => setForm({ ...form, fit_score: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <Input 
                    placeholder="Next move" 
                    value={form.next_move}
                    onChange={e => setForm({ ...form, next_move: e.target.value })}
                  />
                  <Textarea 
                    placeholder="Strategic insight" 
                    value={form.insight}
                    onChange={e => setForm({ ...form, insight: e.target.value })}
                    rows={2}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => updateMutation.mutate({ id: partnership.id, ...form })}
                    disabled={updateMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <StatusIcon status={partnership.status} />
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{partnership.name}</h3>
                        <p className="text-xs text-muted-foreground">{partnership.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-xs text-muted-foreground">Strategic fit</p>
                        <FitScoreBar score={partnership.fit_score} />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(partnership)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(partnership.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {partnership.insight && (
                    <p className="founder-insight-text mb-4">{partnership.insight}</p>
                  )}

                  {/* Log Contact Form */}
                  {loggingContactId === partnership.id && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Log Contact</p>
                        <Button variant="ghost" size="sm" onClick={() => { setLoggingContactId(null); setContactNote(''); }}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Textarea 
                        placeholder="What was discussed? (optional)"
                        value={contactNote}
                        onChange={e => setContactNote(e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => logContactMutation.mutate({ partnershipId: partnership.id, notes: contactNote })}
                        disabled={logContactMutation.isPending}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Save Contact
                      </Button>
                    </div>
                  )}

                  {/* Contact History */}
                  {partnershipContacts.length > 0 && (
                    <div className="mb-4">
                      <button 
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setExpandedHistoryId(isExpanded ? null : partnership.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {partnershipContacts.length} contact{partnershipContacts.length !== 1 ? 's' : ''} logged
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-border">
                          {partnershipContacts.slice(0, 5).map(log => (
                            <div key={log.id} className="text-xs">
                              <p className="text-muted-foreground">
                                {format(new Date(log.contacted_at), 'MMM d, yyyy')}
                              </p>
                              {log.notes && (
                                <p className="text-foreground mt-0.5">{log.notes}</p>
                              )}
                            </div>
                          ))}
                          {partnershipContacts.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              +{partnershipContacts.length - 5} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        Last contact: {partnership.last_contact 
                          ? formatDistanceToNow(new Date(partnership.last_contact), { addSuffix: true })
                          : 'Never'}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-1 text-xs h-7"
                        onClick={() => { setLoggingContactId(partnership.id); setContactNote(''); }}
                        disabled={loggingContactId === partnership.id}
                      >
                        <Phone className="h-3 w-3" />
                        Log contact
                      </Button>
                    </div>
                    {partnership.next_move && (
                      <Button size="sm" variant="ghost" className="gap-1 text-xs h-7">
                        {partnership.next_move}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </FounderLayout>
  );
}
