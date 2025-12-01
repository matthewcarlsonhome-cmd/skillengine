import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, MapPin, Briefcase, Code, BarChart3, PieChart, Building2, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

interface SkillTrend {
  name: string;
  demand: number;
  change: number;
  avgSalary: string;
  jobs: number;
}

interface RoleSalary {
  role: string;
  min: number;
  median: number;
  max: number;
  yoyChange: number;
}

interface LocationData {
  city: string;
  costIndex: number;
  techJobs: number;
  avgSalary: string;
  growth: number;
}

const TRENDING_SKILLS: SkillTrend[] = [
  { name: 'AI/Machine Learning', demand: 95, change: 42, avgSalary: '$165,000', jobs: 45000 },
  { name: 'Python', demand: 92, change: 18, avgSalary: '$145,000', jobs: 125000 },
  { name: 'Cloud (AWS/GCP/Azure)', demand: 90, change: 25, avgSalary: '$155,000', jobs: 95000 },
  { name: 'Kubernetes/Docker', demand: 85, change: 30, avgSalary: '$150,000', jobs: 55000 },
  { name: 'React/TypeScript', demand: 88, change: 15, avgSalary: '$140,000', jobs: 85000 },
  { name: 'Data Engineering', demand: 82, change: 35, avgSalary: '$160,000', jobs: 35000 },
  { name: 'Cybersecurity', demand: 80, change: 28, avgSalary: '$145,000', jobs: 42000 },
  { name: 'Product Management', demand: 78, change: 12, avgSalary: '$155,000', jobs: 28000 },
  { name: 'DevOps/SRE', demand: 85, change: 20, avgSalary: '$158,000', jobs: 38000 },
  { name: 'Generative AI', demand: 75, change: 150, avgSalary: '$175,000', jobs: 15000 },
];

const DECLINING_SKILLS: SkillTrend[] = [
  { name: 'jQuery', demand: 25, change: -35, avgSalary: '$95,000', jobs: 5000 },
  { name: 'PHP (Legacy)', demand: 30, change: -25, avgSalary: '$85,000', jobs: 8000 },
  { name: 'Flash/ActionScript', demand: 5, change: -80, avgSalary: '$70,000', jobs: 200 },
  { name: 'COBOL', demand: 15, change: -10, avgSalary: '$110,000', jobs: 3000 },
  { name: 'Perl', demand: 20, change: -20, avgSalary: '$100,000', jobs: 4000 },
];

const ROLE_SALARIES: RoleSalary[] = [
  { role: 'Software Engineer', min: 80, median: 135, max: 220, yoyChange: 8 },
  { role: 'Senior Software Engineer', min: 120, median: 175, max: 280, yoyChange: 10 },
  { role: 'Staff Engineer', min: 180, median: 250, max: 400, yoyChange: 12 },
  { role: 'Engineering Manager', min: 160, median: 220, max: 350, yoyChange: 7 },
  { role: 'Product Manager', min: 100, median: 155, max: 250, yoyChange: 6 },
  { role: 'Senior Product Manager', min: 140, median: 190, max: 300, yoyChange: 8 },
  { role: 'Data Scientist', min: 95, median: 145, max: 230, yoyChange: 9 },
  { role: 'ML Engineer', min: 120, median: 180, max: 320, yoyChange: 15 },
  { role: 'DevOps Engineer', min: 100, median: 150, max: 240, yoyChange: 11 },
  { role: 'UX Designer', min: 75, median: 115, max: 180, yoyChange: 5 },
];

const LOCATION_DATA: LocationData[] = [
  { city: 'San Francisco', costIndex: 180, techJobs: 285000, avgSalary: '$175,000', growth: 5 },
  { city: 'New York', costIndex: 165, techJobs: 245000, avgSalary: '$165,000', growth: 8 },
  { city: 'Seattle', costIndex: 150, techJobs: 165000, avgSalary: '$170,000', growth: 6 },
  { city: 'Austin', costIndex: 105, techJobs: 125000, avgSalary: '$145,000', growth: 18 },
  { city: 'Denver', costIndex: 110, techJobs: 85000, avgSalary: '$140,000', growth: 15 },
  { city: 'Boston', costIndex: 145, techJobs: 115000, avgSalary: '$155,000', growth: 7 },
  { city: 'Los Angeles', costIndex: 155, techJobs: 175000, avgSalary: '$155,000', growth: 4 },
  { city: 'Chicago', costIndex: 100, techJobs: 95000, avgSalary: '$135,000', growth: 6 },
  { city: 'Miami', costIndex: 115, techJobs: 55000, avgSalary: '$130,000', growth: 22 },
  { city: 'Remote', costIndex: 100, techJobs: 450000, avgSalary: '$145,000', growth: 35 },
];

const INDUSTRY_HIRING = [
  { name: 'AI/ML Startups', openings: 45000, growth: 85 },
  { name: 'FinTech', openings: 38000, growth: 25 },
  { name: 'Healthcare Tech', openings: 32000, growth: 30 },
  { name: 'E-commerce', openings: 28000, growth: 15 },
  { name: 'Cybersecurity', openings: 42000, growth: 40 },
  { name: 'Cloud Infrastructure', openings: 35000, growth: 28 },
  { name: 'EdTech', openings: 18000, growth: 20 },
  { name: 'Enterprise SaaS', openings: 55000, growth: 18 },
];

const MarketInsightsPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('Software Engineer');

  const selectedRoleSalary = ROLE_SALARIES.find(r => r.role === selectedRole)!;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-indigo-500" />
          Job Market Insights
        </h1>
        <p className="text-muted-foreground mt-2">
          Trending skills, salary data, and hiring activity across the tech industry
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Data is illustrative and updated periodically. Last update: December 2024
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Hiring Trend</span>
          </div>
          <div className="text-2xl font-bold">+12%</div>
          <div className="text-sm text-muted-foreground">YoY tech job growth</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Briefcase className="h-4 w-4" />
            <span className="text-xs">Open Roles</span>
          </div>
          <div className="text-2xl font-bold">1.2M</div>
          <div className="text-sm text-muted-foreground">Active tech listings</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Median Salary</span>
          </div>
          <div className="text-2xl font-bold">$155K</div>
          <div className="text-sm text-muted-foreground">Tech industry average</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-orange-500 mb-1">
            <Zap className="h-4 w-4" />
            <span className="text-xs">Hot Skill</span>
          </div>
          <div className="text-2xl font-bold">Gen AI</div>
          <div className="text-sm text-muted-foreground">+150% demand YoY</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Trending Skills */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top Skills in Demand
          </h2>
          <div className="space-y-3">
            {TRENDING_SKILLS.map((skill, index) => (
              <div key={skill.name} className="flex items-center gap-3">
                <div className="w-6 text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">{skill.name}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{skill.avgSalary}</span>
                      <span className="flex items-center text-green-500">
                        <ArrowUpRight className="h-3 w-3" />
                        {skill.change}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                      style={{ width: `${skill.demand}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Declining Skills */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Declining Skills
          </h2>
          <div className="space-y-3 mb-6">
            {DECLINING_SKILLS.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div>
                  <span className="font-medium text-sm">{skill.name}</span>
                  <div className="text-xs text-muted-foreground">{skill.jobs.toLocaleString()} jobs</div>
                </div>
                <div className="flex items-center text-red-500">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="font-medium">{skill.change}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium text-sm mb-2">What This Means</h3>
            <p className="text-sm text-muted-foreground">
              Skills on this list are seeing reduced demand. If you primarily use these technologies,
              consider upskilling in modern alternatives or complementary technologies.
            </p>
          </div>
        </div>
      </div>

      {/* Salary Explorer */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Salary Explorer
        </h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {ROLE_SALARIES.map((role) => (
            <Button
              key={role.role}
              variant={selectedRole === role.role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole(role.role)}
            >
              {role.role}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Minimum</div>
            <div className="text-2xl font-bold">${selectedRoleSalary.min}K</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 text-center border-2 border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Median</div>
            <div className="text-3xl font-bold text-primary">${selectedRoleSalary.median}K</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Maximum</div>
            <div className="text-2xl font-bold">${selectedRoleSalary.max}K</div>
          </div>
        </div>

        {/* Salary Range Bar */}
        <div className="relative h-8 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="absolute h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500"
            style={{
              left: `${(selectedRoleSalary.min / 400) * 100}%`,
              width: `${((selectedRoleSalary.max - selectedRoleSalary.min) / 400) * 100}%`,
            }}
          />
          <div
            className="absolute top-0 bottom-0 w-1 bg-white border-2 border-gray-800"
            style={{ left: `${(selectedRoleSalary.median / 400) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$0K</span>
          <span>$100K</span>
          <span>$200K</span>
          <span>$300K</span>
          <span>$400K+</span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Year over Year Change:</span>
          <span className="flex items-center text-green-500 font-medium">
            <ArrowUpRight className="h-4 w-4" />
            +{selectedRoleSalary.yoyChange}%
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Location Data */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Top Tech Hubs
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Location</th>
                  <th className="text-right py-2 font-medium">Avg Salary</th>
                  <th className="text-right py-2 font-medium">COL</th>
                  <th className="text-right py-2 font-medium">Growth</th>
                </tr>
              </thead>
              <tbody>
                {LOCATION_DATA.map((loc) => (
                  <tr key={loc.city} className="border-b border-muted hover:bg-muted/50">
                    <td className="py-2">
                      <div className="font-medium">{loc.city}</div>
                      <div className="text-xs text-muted-foreground">
                        {loc.techJobs.toLocaleString()} jobs
                      </div>
                    </td>
                    <td className="text-right py-2">{loc.avgSalary}</td>
                    <td className="text-right py-2">
                      <span className={loc.costIndex > 130 ? 'text-red-500' : loc.costIndex > 110 ? 'text-yellow-500' : 'text-green-500'}>
                        {loc.costIndex}%
                      </span>
                    </td>
                    <td className="text-right py-2">
                      <span className="text-green-500 flex items-center justify-end">
                        <ArrowUpRight className="h-3 w-3" />
                        {loc.growth}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            COL = Cost of Living Index (100 = US average)
          </p>
        </div>

        {/* Industry Hiring */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-500" />
            Industries Hiring
          </h2>
          <div className="space-y-3">
            {INDUSTRY_HIRING.map((industry) => (
              <div key={industry.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{industry.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {(industry.openings / 1000).toFixed(0)}K openings
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all"
                      style={{ width: `${(industry.openings / 55000) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-green-500 w-14 text-right flex items-center justify-end">
                  <ArrowUpRight className="h-3 w-3" />
                  {industry.growth}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Key Takeaways</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">AI is Dominating</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Generative AI skills see 150% YoY growth. Adding AI to your skillset dramatically increases marketability.
            </p>
          </div>
          <div className="bg-background/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Remote is Growing</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Remote positions grew 35% YoY with 450K+ openings. Geographic flexibility expands your options significantly.
            </p>
          </div>
          <div className="bg-background/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="font-medium">Salaries Rising</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tech salaries up 8-15% YoY on average. ML Engineers and Staff-level roles seeing the largest increases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsightsPage;
