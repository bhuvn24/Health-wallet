"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Activity,
  Droplets,
  Plus,
  Search,
  Share2,
  FileText,
  Filter,
  Calendar,
  ShieldCheck,
  UserPlus,
  TrendingUp,
  AlertCircle,
  Smartphone,
  Thermometer,
  LogOut,
  Download,
  Loader2
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { signOut } from "@/app/auth/actions";
import { uploadReport, getDownloadUrl } from "@/app/reports/actions";
import { addVital } from "@/app/vitals/actions";
import { shareReport } from "@/app/sharing/actions";

interface HealthWalletClientProps {
  initialReports: any[];
  initialVitals: any[];
  initialShares: any[];
  user: any;
}

const HEALTH_RANGES: Record<string, { min: number; max: number; label: string }> = {
  'Heart Rate': { min: 60, max: 100, label: '60 - 100' },
  'Blood Pressure': { min: 90, max: 120, label: '90 - 120' },
  'Blood Sugar': { min: 70, max: 140, label: '70 - 140' },
  'Body Temp': { min: 97, max: 99, label: '97 - 99' }
};

const VITAL_UNITS: Record<string, string> = {
  'Heart Rate': 'bpm',
  'Blood Pressure': 'mmHg',
  'Blood Sugar': 'mg/dL',
  'Body Temp': '°C'
};

export function HealthWalletClient({ initialReports, initialVitals, initialShares, user }: HealthWalletClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sharingReport, setSharingReport] = useState<any>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddVitalOpen, setIsAddVitalOpen] = useState(false);
  const [chartMetric, setChartMetric] = useState("hr");
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingVital, setIsAddingVital] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedVitalType, setSelectedVitalType] = useState("Heart Rate");

  const [shares, setShares] = useState(initialShares);

  // Sync shares if initialShares changes (e.g. on manual refresh)
  useMemo(() => {
    setShares(initialShares);
  }, [initialShares]);

  const filteredReports = useMemo(() => {
    // ... no change
    return initialReports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.report_type || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === "all" || (report.report_type || "").toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [initialReports, searchQuery, filterType]);

  // ... (vitalsData, latestVitals, healthStatus hooks remain unchanged)

  // ...

  async function handleShare(email: string) {
    if (!sharingReport) return;
    setIsSharing(true);
    const result = await shareReport(sharingReport.id, email);
    setIsSharing(false);
    if (result.success) {
      toast.success(`Access granted to ${email}`);

      // Update local state for realtime effect
      const newShare = {
        id: (result as any).share.id,
        report_id: sharingReport.id,
        shared_with_email: email,
        access_level: 'read',
        health_reports: sharingReport
      };
      setShares(prev => [...prev, newShare]);

      setSharingReport(null);
    } else {
      toast.error((result as any).error || "Sharing failed");
    }
  }

  const vitalsData = useMemo(() => {
    // Group vitals by date for the chart
    const grouped: any = {};
    const sortedVitals = [...initialVitals].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
    sortedVitals.forEach(v => {
      const date = new Date(v.recorded_at).toLocaleDateString('en-US', { weekday: 'short' });
      if (!grouped[date]) grouped[date] = { time: date };

      if (v.vital_type === 'Heart Rate') grouped[date].hr = v.value;
      if (v.vital_type === 'Blood Pressure') grouped[date].bp = v.value;
      if (v.vital_type === 'Blood Sugar') grouped[date].bloodSugar = v.value;
      if (v.vital_type === 'Body Temp') grouped[date].bodyTemp = v.value;
    });
    return Object.values(grouped);
  }, [initialVitals]);

  const latestVitals = useMemo(() => {
    const latest: any = {};
    initialVitals.forEach(v => {
      if (!latest[v.vital_type] || new Date(v.recorded_at) > new Date(latest[v.vital_type].recorded_at)) {
        latest[v.vital_type] = v;
      }
    });
    return latest;
  }, [initialVitals]);

  const healthStatus = useMemo(() => {
    const issues: string[] = [];
    let hasData = false;

    Object.keys(HEALTH_RANGES).forEach(type => {
      const vital = latestVitals[type];
      if (vital) {
        hasData = true;
        const val = parseFloat(vital.value);
        const range = HEALTH_RANGES[type];
        if (val < range.min || val > range.max) {
          issues.push(`${type} is out of healthy range (${range.label})`);
        }
      }
    });

    if (!hasData) return { status: 'No data', message: 'Add vitals to get a health check', color: 'text-slate-500', bg: 'bg-slate-50', icon: <Activity className="w-12 h-12 text-slate-500" /> };

    if (issues.length === 0) {
      return {
        status: 'Healthy',
        message: 'You are healthy! Keep it up.',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        icon: <ShieldCheck className="w-12 h-12 text-emerald-500" />
      };
    }

    return {
      status: 'Attention Needed',
      message: 'You are not healthy. ' + issues[0],
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      icon: <AlertCircle className="w-12 h-12 text-rose-500" />
    };
  }, [latestVitals]);

  async function handleUpload(formData: FormData) {
    setIsUploading(true);
    const result = await uploadReport(formData);
    setIsUploading(false);
    if (result.success) {
      toast.success("Report uploaded successfully!");
      setIsUploadOpen(false);
    } else {
      toast.error((result as any).error || "Upload failed");
    }
  }

  async function handleAddVital(formData: FormData) {
    setIsAddingVital(true);
    const result = await addVital(formData);
    setIsAddingVital(false);
    if (result.success) {
      toast.success("Vital added successfully!");
      setIsAddVitalOpen(false);
    } else {
      toast.error((result as any).error || "Failed to add vital");
    }
  }



  async function handleDownload(filePath: string, name: string) {
    const url = await getDownloadUrl(filePath);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
    } else {
      toast.error("Could not get download link");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="bg-rose-500 p-2 rounded-xl shadow-lg shadow-rose-200">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Health Wallet
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Welcome <span className="text-slate-900">{user?.full_name || user?.email?.split('@')[0] || 'User'}</span> 👋
            </p>
          </div>
        </motion.div>

        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2" onClick={() => setIsAddVitalOpen(true)}>
            <Activity className="w-4 h-4" />
            Add Vital
          </Button>
          <Button className="bg-rose-500 hover:bg-rose-600 rounded-full gap-2 shadow-lg shadow-rose-100" onClick={() => setIsUploadOpen(true)}>
            <Plus className="w-4 h-4" />
            Upload Report
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => signOut()}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Heart Rate"
            value={latestVitals['Heart Rate']?.value || "N/A"}
            unit="bpm"
            icon={<Heart className="text-rose-500" />}
            color="bg-rose-50"
            trend={latestVitals['Heart Rate'] ? "Last recorded: " + new Date(latestVitals['Heart Rate'].recorded_at).toLocaleDateString() : "No data"}
            range={HEALTH_RANGES['Heart Rate'].label}
          />
          <StatCard
            title="Blood Pressure"
            value={latestVitals['Blood Pressure']?.value || "N/A"}
            unit="mmHg"
            icon={<Activity className="text-blue-500" />}
            color="bg-blue-50"
            trend={latestVitals['Blood Pressure'] ? "Last recorded: " + new Date(latestVitals['Blood Pressure'].recorded_at).toLocaleDateString() : "No data"}
            range={HEALTH_RANGES['Blood Pressure'].label}
          />
          <StatCard
            title="Blood Sugar"
            value={latestVitals['Blood Sugar']?.value || "N/A"}
            unit="mg/dL"
            icon={<Droplets className="text-orange-500" />}
            color="bg-orange-50"
            trend={latestVitals['Blood Sugar'] ? "Last recorded: " + new Date(latestVitals['Blood Sugar'].recorded_at).toLocaleDateString() : "No data"}
            range={HEALTH_RANGES['Blood Sugar'].label}
          />
          <StatCard
            title="Body Temp"
            value={latestVitals['Body Temp']?.value || "N/A"}
            unit="°F"
            icon={<Thermometer className="text-emerald-500" />}
            color="bg-emerald-50"
            trend={latestVitals['Body Temp'] ? "Last recorded: " + new Date(latestVitals['Body Temp'].recorded_at).toLocaleDateString() : "No data"}
            range={HEALTH_RANGES['Body Temp'].label}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/50 backdrop-blur-sm border p-1 rounded-2xl mb-6">
            <TabsTrigger value="overview" className="rounded-xl px-8">Overview</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl px-8">Reports</TabsTrigger>
            <TabsTrigger value="sharing" className="rounded-xl px-8">Sharing</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50">
                    <CardHeader className="pb-0">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Vital Trends</CardTitle>
                        <Select value={chartMetric} onValueChange={setChartMetric}>
                          <SelectTrigger className="w-[140px] border-none bg-slate-100 rounded-full h-8">
                            <SelectValue placeholder="Metric" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hr">Heart Rate</SelectItem>
                            <SelectItem value="bp">Blood Pressure</SelectItem>
                            <SelectItem value="bloodSugar">Blood Sugar</SelectItem>
                            <SelectItem value="bodyTemp">Body Temp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-4">
                      {vitalsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={vitalsData}>
                            <defs>
                              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartMetric === 'hr' ? '#f43f5e' : chartMetric === 'bp' ? '#3b82f6' : chartMetric === 'bloodSugar' ? '#f97316' : '#10b981'} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={chartMetric === 'hr' ? '#f43f5e' : chartMetric === 'bp' ? '#3b82f6' : chartMetric === 'bloodSugar' ? '#f97316' : '#10b981'} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey={chartMetric} stroke={chartMetric === 'hr' ? '#f43f5e' : chartMetric === 'bp' ? '#3b82f6' : chartMetric === 'bloodSugar' ? '#f97316' : '#10b981'} strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">No data available for charts</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Health Summary</CardTitle>
                      <CardDescription>Based on your latest records</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="text-center space-y-4">
                        <div className={`${healthStatus.bg} p-6 rounded-full inline-block`}>
                          {healthStatus.icon}
                        </div>
                        <h3 className={`text-xl font-bold ${healthStatus.color}`}>{healthStatus.status}</h3>
                        <p className="text-slate-500 px-4">{healthStatus.message}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "reports" && (
              <motion.div key="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input placeholder="Search reports..." className="pl-10 rounded-2xl border-none shadow-sm h-12 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px] rounded-2xl border-none shadow-sm h-12 bg-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Blood Test">Blood Test</SelectItem>
                      <SelectItem value="Imaging">Imaging</SelectItem>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredReports.map((report) => (
                    <motion.div layout key={report.id} whileHover={{ y: -4 }} className="group bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-rose-50 transition-colors">
                            <FileText className="w-6 h-6 text-slate-400 group-hover:text-rose-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{report.name}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(report.report_date).toLocaleDateString()}
                            </p>
                            <Badge variant="secondary" className="mt-2 rounded-full bg-slate-100">{report.report_type}</Badge>

                            {/* Analysis Section */}
                            {report.ai_analysis && (() => {
                              try {
                                const analysis = JSON.parse(report.ai_analysis);
                                return (
                                  <div className="mt-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                                    <h4 className="text-sm font-semibold text-rose-700 mb-2 flex items-center gap-2">
                                      <Smartphone className="w-4 h-4" /> AI Analysis
                                    </h4>
                                    {analysis.summary && (
                                      <div className="mb-3">
                                        <p className="text-xs font-semibold text-slate-700 uppercase mb-1">Summary</p>
                                        <div className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: analysis.summary }} />
                                      </div>
                                    )}
                                    {analysis.recommendations && (
                                      <div>
                                        <p className="text-xs font-semibold text-slate-700 uppercase mb-1">Recommendations</p>
                                        <div className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: analysis.recommendations }} />
                                      </div>
                                    )}
                                  </div>
                                );
                              } catch (e) { return null; }
                            })()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleDownload(report.file_path, report.name)}>
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSharingReport(report)}>
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "sharing" && (
              <motion.div key="sharing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 rounded-3xl border-none shadow-xl shadow-slate-200/50">
                  <CardHeader>
                    <CardTitle>Active Access</CardTitle>
                    <CardDescription>People who can see your selected reports</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {shares.length > 0 ? shares.map((share: any) => (
                      <div key={share.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {share.shared_with_email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{share.shared_with_email}</p>
                            <p className="text-xs text-slate-500">Access to: {share.health_reports.name}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-rose-500">Revoke</Button>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-400">No active shares</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-none bg-rose-500 text-white shadow-xl shadow-rose-200 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <UserPlus className="w-32 h-32" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white">Sharing Info</CardTitle>
                    <CardDescription className="text-rose-100">Your health data is shared securely</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">You can share individual reports with doctors or family members by clicking the share icon on any report.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </main>

      <Dialog open={!!sharingReport} onOpenChange={() => setSharingReport(null)}>
        <DialogContent className="rounded-3xl max-w-md border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>Grant access to {sharingReport?.name}</DialogDescription>
          </DialogHeader>
          <form action={(formData) => handleShare(formData.get('email') as string)} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Email</label>
              <Input name="email" type="email" placeholder="doctor@example.com" required className="rounded-xl" />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" className="rounded-xl" onClick={() => setSharingReport(null)}>Cancel</Button>
              <Button type="submit" className="bg-rose-500 hover:bg-rose-600 rounded-xl px-8" disabled={isSharing}>
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Share Access'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Upload Report</DialogTitle>
                <DialogDescription>Fill in the details for your medical report.</DialogDescription>
              </DialogHeader>
              <form action={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Name</label>
                  <Input name="name" placeholder="Blood Test" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select name="report_type" required>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blood Test">Blood Test</SelectItem>
                      <SelectItem value="Imaging">Imaging</SelectItem>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input name="report_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">File (PDF/Image)</label>
                  <Input name="file" type="file" accept="image/*,.pdf" required className="rounded-xl" />
                </div>
                <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 rounded-xl h-12 font-semibold" disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload Report'}
                </Button>
              </form>
            </div>
            <div className="bg-slate-900 p-8 text-white flex flex-col justify-center items-center text-center space-y-4">
              <div className="bg-emerald-500/10 p-4 rounded-3xl mb-2">
                <Smartphone className="w-12 h-12 text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold">Secure Storage</h4>
              <p className="text-slate-400 text-sm">Your data is encrypted and stored securely on our servers.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddVitalOpen} onOpenChange={setIsAddVitalOpen}>
        <DialogContent className="rounded-3xl max-w-md border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vital</DialogTitle>
            <DialogDescription>Track your health metrics over time.</DialogDescription>
          </DialogHeader>
          <form action={handleAddVital} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vital Type</label>
              <Select name="vital_type" required onValueChange={setSelectedVitalType} defaultValue={selectedVitalType}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Heart Rate">Heart Rate</SelectItem>
                  <SelectItem value="Blood Pressure">Blood Pressure</SelectItem>
                  <SelectItem value="Blood Sugar">Blood Sugar</SelectItem>
                  <SelectItem value="Body Temp">Body Temp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <div className="relative">
                <Input name="value" type="number" step="0.1" placeholder="e.g. 72" required className="rounded-xl pr-16" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
                  {VITAL_UNITS[selectedVitalType]}
                </div>
              </div>
            </div>
            <input type="hidden" name="unit" value={VITAL_UNITS[selectedVitalType]} />
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input name="recorded_at" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="rounded-xl" />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" className="rounded-xl" onClick={() => setIsAddVitalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-rose-500 hover:bg-rose-600 rounded-xl px-8" disabled={isAddingVital}>
                {isAddingVital ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Vital'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2025 Health Wallet • Secure • Private • Reliable</p>
      </footer>
    </div>
  );
}

function StatCard({ title, value, unit, icon, color, trend, range }: any) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          {icon}
        </div>
        <TrendingUp className="w-4 h-4 text-slate-300" />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          <span className="text-slate-400 text-xs font-medium uppercase">{unit}</span>
        </div>
        <p className="text-[10px] mt-2 font-medium text-slate-400">{trend}</p>
        {range && <p className="text-[10px] mt-1 font-medium text-emerald-600/70">Healthy: {range}</p>}
      </div>
    </motion.div>
  );
}
