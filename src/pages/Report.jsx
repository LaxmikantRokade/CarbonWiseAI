import { useState, useMemo } from 'react';
import { FileText, Download, Share2, CheckCircle2, Copy, Leaf, TreePine } from 'lucide-react';
import reportsImg from '../assets/images/reports.png';
import { useCarbon } from '../context/CarbonContext';
import { categoryColors, categoryLabels, averages } from '../data/carbonFactors';
import { achievements } from '../data/achievements';
import CarbonScore from '../components/CarbonScore';

export default function Report() {
  const { state } = useCarbon();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const reportData = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeek = state.entries.filter((e) => new Date(e.date) >= weekAgo);
    const lastWeek = state.entries.filter(
      (e) => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < weekAgo
    );

    const thisWeekTotal = thisWeek.reduce((s, e) => s + (e.amount || 0), 0);
    const lastWeekTotal = lastWeek.reduce((s, e) => s + (e.amount || 0), 0);

    const catBreakdown = {};
    const totalEmissions = state.entries.reduce((s, e) => s + (e.amount || 0), 0);
    state.entries.forEach((e) => {
      catBreakdown[e.category] = (catBreakdown[e.category] || 0) + (e.amount || 0);
    });

    const annualEstimate = (totalEmissions / Math.max(state.entries.length, 1)) * 365;
    const treesNeeded = Math.ceil(annualEstimate / 1000 * averages.trees_per_tonne_co2);
    const drivingEquiv = Math.round(annualEstimate / 0.21); // km driving equivalent

    const highestCat = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1])[0];

    const recommendations = [];
    if (highestCat) {
      const cat = highestCat[0];
      if (cat === 'transport') {
        recommendations.push('Consider switching to public transit or cycling for daily commutes');
        recommendations.push('Try carpooling to reduce per-trip emissions by 50%');
        recommendations.push('Work from home when possible to eliminate commute emissions');
      } else if (cat === 'food') {
        recommendations.push('Try incorporating more plant-based meals into your diet');
        recommendations.push('Reduce beef consumption — it has 5x the footprint of chicken');
        recommendations.push('Buy local and seasonal produce to cut food transport emissions');
      } else if (cat === 'electricity') {
        recommendations.push('Switch to LED bulbs to save 75% on lighting energy');
        recommendations.push('Unplug devices when not in use to eliminate phantom loads');
        recommendations.push('Consider a green energy plan from your utility provider');
      } else if (cat === 'waste') {
        recommendations.push('Start composting food scraps to prevent landfill methane');
        recommendations.push('Separate recyclables — paper, plastic, glass, and metal');
        recommendations.push('Use reusable bags and containers to reduce packaging waste');
      }
    }

    const unlockedBadges = achievements.filter((a) =>
      state.unlockedAchievements.includes(a.id)
    );

    return {
      thisWeekTotal,
      lastWeekTotal,
      totalEmissions,
      catBreakdown,
      annualEstimate,
      treesNeeded,
      drivingEquiv,
      recommendations,
      unlockedBadges,
      highestCat,
    };
  }, [state]);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    console.log('--- PDF Capture Started ---');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const element = document.getElementById('report-content');
      if (!element) throw new Error('Report content not found');

      // Temporarily remove animations to ensure correct capture
      const originalTransform = element.style.transform;
      element.style.transform = 'none';

      console.log('Running html2canvas...');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (doc, elementClone) => {
          console.log('[html2canvas onclone] Sanitizing cloned DOM...');

          // 1. Remove SVG filters to prevent canvas tainting (fixes Safari DOMException)
          const svgs = elementClone.querySelectorAll('svg');
          svgs.forEach(svg => {
            const elementsWithFilter = svg.querySelectorAll('[filter]');
            elementsWithFilter.forEach(el => el.removeAttribute('filter'));
          });

          // 2. Convert oklch/oklab/color(display-p3...) to rgb()
          // Create a hidden canvas to leverage browser's native color conversion
          const cvs = doc.createElement('canvas');
          cvs.width = 1;
          cvs.height = 1;
          const ctx = cvs.getContext('2d', { willReadFrequently: true });

          const convertToRgb = (colorStr) => {
            if (!colorStr) return colorStr;
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = 'rgba(0,0,0,0)'; // Reset
            ctx.fillStyle = colorStr; // Browser parses the color
            ctx.fillRect(0, 0, 1, 1);
            const data = ctx.getImageData(0, 0, 1, 1).data;
            return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
          };

          // Regex to match any unsupported color function
          const colorRegex = /(?:oklch|oklab|color)\([^)]+\)/g;
          const sanitizeColorString = (str) => {
            if (!str) return str;
            if (!str.includes('oklch') && !str.includes('oklab') && !str.includes('color(')) return str;
            return str.replace(colorRegex, (match) => convertToRgb(match));
          };

          const colorProps = [
            'color', 'backgroundColor', 'borderColor', 'borderTopColor',
            'borderRightColor', 'borderBottomColor', 'borderLeftColor',
            'outlineColor', 'textDecorationColor', 'fill', 'stroke'
          ];
          const complexProps = ['boxShadow', 'textShadow', 'backgroundImage'];

          const allElements = [elementClone, ...elementClone.querySelectorAll('*')];
          let sanitizedCount = 0;

          allElements.forEach(el => {
            const computed = doc.defaultView.getComputedStyle(el);
            if (!computed) return;

            // Handle standard color properties
            colorProps.forEach(prop => {
              const val = computed[prop];
              if (val && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
                try {
                  console.log(`[Unsupported Color Found] Element:`, el, `| Property: ${prop} | Value: ${val}`);
                  el.style[prop] = convertToRgb(val);
                  sanitizedCount++;
                } catch (e) {
                  console.warn(`[Sanitize Error] Failed to convert ${prop}: ${val}`, el, e);
                }
              }
            });

            // Handle complex properties like shadows and gradients
            complexProps.forEach(prop => {
              const val = computed[prop];
              if (val && val !== 'none' && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
                try {
                  console.log(`[Unsupported Complex Color Found] Element:`, el, `| Property: ${prop} | Value: ${val}`);
                  el.style[prop] = sanitizeColorString(val);
                  sanitizedCount++;
                } catch (e) {
                  console.warn(`[Sanitize Error] Failed to convert complex ${prop}: ${val}`, el, e);
                }
              }
            });
          });

          console.log(`[html2canvas onclone] Sanitization complete. Converted ${sanitizedCount} unsupported colors.`);
        }
      });
      console.log('html2canvas success.');

      element.style.transform = originalTransform;

      console.log('Generating jsPDF...');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      try {
        pdf.save('carbonwise-report.pdf');
        console.log('jsPDF generation and save success.');
      } catch (e) {
        console.log('pdf.save() blocked, using fallback blob download...', e);
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'carbonwise-report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Fallback jsPDF download success.');
      }
      console.log('--- PDF Capture Finished ---');
    } catch (err) {
      console.error('--- PDF Capture Failed ---');
      console.error('Error details:', err);
      alert(err.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyShare = () => {
    const text = `🌱 My CarbonWise Report\n\nCarbon Score: ${state.carbonScore}/100\nStreak: ${state.streak} days\nBadges: ${state.unlockedAchievements.length}/${achievements.length}\nWeekly Emissions: ${reportData.thisWeekTotal.toFixed(1)} kg CO₂\n\nTrack your footprint at CarbonWise AI!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreInterpretation = state.carbonScore >= 80
    ? 'Excellent! You\'re an eco champion with a remarkably low carbon footprint.'
    : state.carbonScore >= 60
    ? 'Good progress! You\'re making conscious choices that benefit the planet.'
    : state.carbonScore >= 40
    ? 'Room for improvement. Small changes can make a big difference.'
    : 'Let\'s work together to reduce your footprint. Every action counts!';

  return (
    <div className="page-enter p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-slide-up relative glass-card overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="flex-1 space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
              <FileText className="w-7 h-7 text-emerald-500" />
              Sustainability <span className="text-gradient">Report</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto md:mx-0 text-sm md:text-base">
              Your personalized carbon footprint analysis, weekly comparisons, and tailored recommendations.
            </p>
          </div>
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
            <img src={reportsImg} alt="Reports" className="w-full h-full object-contain relative z-10 animate-float" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 animate-slide-up stagger-1">
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>
        <button
          onClick={handleCopyShare}
          className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Share Summary'}
        </button>
      </div>

      {/* Report Card */}
      <div
        id="report-content"
        className="bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up stagger-2"
        style={{ color: '#1a1a2e' }}
      >
        {/* Report Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">CarbonWise AI</h2>
              <p className="text-sm text-white/80">Personal Sustainability Report</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-white/90 mt-4">
            <div>
              <span className="text-white/60">Name:</span>{' '}
              <span className="font-medium">{state.profile?.name || 'Eco Warrior'}</span>
            </div>
            <div>
              <span className="text-white/60">Generated:</span>{' '}
              <span className="font-medium">{new Date().toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div>
              <span className="text-white/60">Total Entries:</span>{' '}
              <span className="font-medium">{state.entries.length}</span>
            </div>
          </div>
        </div>

        {/* Score Section */}
        <div className="p-8 text-center border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Your Carbon Score</h3>
          <div className="flex justify-center mb-4">
            <CarbonScore score={state.carbonScore} size={180} />
          </div>
          <p className="text-sm text-gray-600 max-w-md mx-auto">{scoreInterpretation}</p>
        </div>

        {/* Emissions Breakdown */}
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Emissions Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(reportData.catBreakdown).map(([cat, value]) => {
              const total = reportData.totalEmissions || 1;
              const pct = ((value / total) * 100).toFixed(1);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{categoryLabels[cat] || cat}</span>
                    <span className="text-gray-500">{value.toFixed(1)} kg ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: categoryColors[cat] || '#10b981',
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(reportData.catBreakdown).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No emissions data yet. Start logging to see your breakdown.</p>
            )}
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Comparison</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">This Week</p>
              <p className="text-3xl font-bold text-gray-800">{reportData.thisWeekTotal.toFixed(1)}</p>
              <p className="text-xs text-gray-400">kg CO₂</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Last Week</p>
              <p className="text-3xl font-bold text-gray-800">{reportData.lastWeekTotal.toFixed(1)}</p>
              <p className="text-xs text-gray-400">kg CO₂</p>
            </div>
          </div>
          {reportData.lastWeekTotal > 0 && (
            <p className={`text-sm text-center mt-3 font-medium ${
              reportData.thisWeekTotal < reportData.lastWeekTotal ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {reportData.thisWeekTotal < reportData.lastWeekTotal
                ? `↓ ${((1 - reportData.thisWeekTotal / reportData.lastWeekTotal) * 100).toFixed(0)}% reduction from last week!`
                : `↑ ${((reportData.thisWeekTotal / reportData.lastWeekTotal - 1) * 100).toFixed(0)}% increase from last week`
              }
            </p>
          )}
        </div>

        {/* Achievements */}
        {reportData.unlockedBadges.length > 0 && (
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Top Achievements</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {reportData.unlockedBadges.slice(0, 6).map((badge) => (
                <div key={badge.id} className="text-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl block mb-1">{badge.icon}</span>
                  <span className="text-[10px] text-gray-600 font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak & Goals */}
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Streak & Goals</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-800">🔥 {state.streak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-800">{state.goals.filter((g) => g.completed).length}</p>
              <p className="text-xs text-gray-500">Goals Completed</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-800">{state.unlockedAchievements.length}</p>
              <p className="text-xs text-gray-500">Badges Earned</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {reportData.recommendations.length > 0 && (
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Personalized Recommendations</h3>
            <div className="space-y-3">
              {reportData.recommendations.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-500 font-bold mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environmental Impact */}
        <div className="p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Environmental Impact Equivalents</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
              <TreePine className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-lg font-bold text-gray-800">{reportData.treesNeeded}</p>
                <p className="text-xs text-gray-500">Trees needed to offset annual emissions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <Share2 className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-lg font-bold text-gray-800">{reportData.drivingEquiv.toLocaleString()}</p>
                <p className="text-xs text-gray-500">km of driving equivalent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center">
          <p className="text-xs text-gray-400">
            Generated by CarbonWise AI · {new Date().toLocaleDateString()} · Data based on EPA & DEFRA emission factors
          </p>
        </div>
      </div>
    </div>
  );
}
