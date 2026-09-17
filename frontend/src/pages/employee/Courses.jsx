import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentsApi } from '../../api/apiClient';
import { Search, PlayCircle, FileText, Clock, CheckCircle2, AlertCircle, FilterX } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-primary",
      active 
        ? "bg-slate-800 text-white border-slate-800" 
        : "bg-white text-text-secondary border-border hover:border-slate-300 hover:bg-slate-50 hover:text-text"
    )}
  >
    {label}
  </button>
);

const isOverdue = (c) => c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'Completed';

const CourseCard = ({ course, featured = false, navigate }) => {
  const overdue = isOverdue(course);
  
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all hover:border-slate-300 hover:bg-slate-50/50 flex flex-col h-full shadow-sm",
        featured ? "border-primary/20" : ""
      )}
      onClick={() => navigate(`/training/${course.moduleId}`)}
    >
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {course.moduleType === 'Video' ? <PlayCircle size={20} /> : <FileText size={20} />}
            </div>
            <div>
              <h3 className="font-semibold text-text leading-tight group-hover:text-primary transition-colors">{course.moduleTitle}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{course.category || 'General'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{course.department || 'All'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {course.status === 'Completed' ? (
              <Badge variant="success">Completed</Badge>
            ) : overdue ? (
              <Badge variant="danger">Overdue</Badge>
            ) : course.isRequired && (
              <Badge variant="warning">Mandatory</Badge>
            )}
          </div>
        </div>
        
        <div className="text-sm text-text-secondary line-clamp-2 mb-6 flex-1">
          {course.moduleDescription}
        </div>
        
        {/* Progress / Deadline Row */}
        <div className="mb-6 space-y-2">
          {course.status === 'InProgress' ? (
            <>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-text-secondary">Progress</span>
                <span className="text-primary">{Math.round(course.videoWatchedPercent || 0)}%</span>
              </div>
              <ProgressBar value={course.videoWatchedPercent || 0} className="h-1.5" />
            </>
          ) : course.status === 'Completed' ? (
            <div className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> 100% Completed
            </div>
          ) : (
            <div className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
              <Clock size={14} /> {course.duration || '0 mins'}
            </div>
          )}
        </div>
        
        {/* Action Row */}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
            {course.dueDate && course.status !== 'Completed' && (
              <>
                <AlertCircle size={14} className={overdue ? "text-danger" : "text-warning"} />
                <span className={overdue ? "text-danger font-semibold" : ""}>
                  Due {new Date(course.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </>
            )}
          </div>
          <Button 
            size="sm" 
            variant={course.status === 'Completed' ? 'secondary' : 'primary'}
            className="min-w-[80px]"
            onClick={(e) => { e.stopPropagation(); navigate(`/training/${course.moduleId}`); }}
          >
            {course.status === 'Completed' ? 'Review' : course.status === 'InProgress' ? 'Resume' : 'Start'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [isMandatoryOnly, setIsMandatoryOnly] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await assignmentsApi.getMy();
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique filter options
  const categories = useMemo(() => ['All', ...new Set(courses.map(c => c.category).filter(Boolean))], [courses]);
  const departments = useMemo(() => ['All', ...new Set(courses.map(c => c.department).filter(Boolean))], [courses]);
  const statuses = ['All', 'NotStarted', 'InProgress', 'Completed'];

  // Apply filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Search
      if (searchQuery && !course.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !course.moduleDescription.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Category
      if (activeCategory !== 'All' && course.category !== activeCategory) return false;
      // Department
      if (activeDepartment !== 'All' && course.department !== activeDepartment) return false;
      // Status
      if (activeStatus !== 'All' && course.status !== activeStatus) return false;
      // Mandatory
      if (isMandatoryOnly && !course.isRequired) return false;

      return true;
    });
  }, [courses, searchQuery, activeCategory, activeDepartment, activeStatus, isMandatoryOnly]);

  // Derived sections
  const inProgressCourses = useMemo(() => {
    return filteredCourses.filter(c => c.status === 'InProgress').slice(0, 3);
  }, [filteredCourses]);

  const mandatoryCourses = useMemo(() => {
    return filteredCourses.filter(c => c.isRequired && c.status !== 'Completed');
  }, [filteredCourses]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveDepartment('All');
    setActiveStatus('All');
    setIsMandatoryOnly(false);
  };



  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1440px] mx-auto min-h-screen">
        <Skeleton className="h-12 w-1/3 mb-4 rounded-lg" />
        <Skeleton className="h-4 w-1/4 mb-8 rounded" />
        <div className="flex gap-4 mb-12">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Header Section */}
      <div className="bg-surface border-b border-border py-8 px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-2xl font-bold text-text mb-2 tracking-tight">Training Directory</h1>
          <p className="text-text-secondary text-sm mb-8 max-w-2xl">
            Access your assigned mandatory training, compliance materials, and professional development courses. 
            Keep your skills up to date.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Chips Container */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full">
              <div className="w-px h-6 bg-border mx-2 hidden md:block shrink-0" />
              
              <FilterChip 
                label={`Mandatory ${isMandatoryOnly ? '✓' : ''}`} 
                active={isMandatoryOnly} 
                onClick={() => setIsMandatoryOnly(!isMandatoryOnly)} 
              />
              
              <div className="w-px h-4 bg-border mx-1 shrink-0" />
              
              {statuses.map(s => (
                <FilterChip 
                  key={s} 
                  label={s === 'NotStarted' ? 'Not Started' : s === 'InProgress' ? 'In Progress' : s} 
                  active={activeStatus === s} 
                  onClick={() => setActiveStatus(s)} 
                />
              ))}

              {categories.length > 2 && (
                <>
                  <div className="w-px h-4 bg-border mx-1 shrink-0" />
                  {categories.map(c => (
                    <FilterChip key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />
                  ))}
                </>
              )}

              {(searchQuery || activeCategory !== 'All' || activeDepartment !== 'All' || activeStatus !== 'All' || isMandatoryOnly) && (
                <button 
                  onClick={resetFilters}
                  className="ml-auto px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <FilterX size={14} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-12 mt-4">
        
        {/* Continue Learning Section */}
        {inProgressCourses.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                <PlayCircle size={18} />
              </div>
              <h2 className="text-lg font-bold text-text tracking-tight">Continue Learning</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map(course => (
                <CourseCard key={course.moduleId} course={course} featured={true} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* Mandatory Courses Section */}
        {mandatoryCourses.length > 0 && !isMandatoryOnly && activeStatus === 'All' && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center text-warning">
                <AlertCircle size={18} />
              </div>
              <h2 className="text-lg font-bold text-text tracking-tight">Action Required</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mandatoryCourses.map(course => (
                <CourseCard key={course.moduleId} course={course} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* All Courses / Filtered Results */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <h2 className="text-lg font-bold text-text tracking-tight">
              {searchQuery || isMandatoryOnly || activeStatus !== 'All' || activeCategory !== 'All' ? 'Search Results' : 'All Courses'}
            </h2>
            <span className="text-sm font-medium text-text-secondary">{filteredCourses.length} courses</span>
          </div>
          
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map(course => (
                <CourseCard key={course.moduleId} course={course} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-surface border border-border rounded-2xl">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">No courses found</h3>
              <p className="text-text-secondary text-sm max-w-sm mb-6">
                We couldn't find any courses matching your current filters. Try adjusting your search criteria.
              </p>
              <Button onClick={resetFilters} variant="secondary">Clear all filters</Button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
