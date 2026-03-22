import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Upload, CheckCircle, User, BookOpen, Code, Briefcase } from 'lucide-react'
import { userApi } from '../../services/api'

const steps = [
  { id: 1, label: 'Basic info', icon: User },
  { id: 2, label: 'Education', icon: BookOpen },
  { id: 3, label: 'Skills', icon: Code },
  { id: 4, label: 'Experience', icon: Briefcase },
]

const allSkills = [
  'Java', 'Python', 'C++', 'JavaScript', 'React', 'Spring Boot',
  'DSA', 'System Design', 'SQL', 'MongoDB', 'AWS', 'Docker',
  'Machine Learning', 'Node.js', 'Git', 'Linux', 'REST APIs', 'OOP',
]

export default function Profile() {
  const [step, setStep] = useState(1)
  const [selectedSkills, setSelectedSkills] = useState(['Java', 'DSA', 'SQL'])
  const [resumeFile, setResumeFile] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      fullName: 'Brijesh Mohanty',
      phone: '',
      rollNumber: 'CS2021001',
      branch: 'Computer Science',
      cgpa: '',
      graduationYear: '2026',
      linkedin: '',
      github: '',
      education: [{ degree: 'B.Tech', institution: '', year: '', percentage: '' }],
      experience: [{ title: '', company: '', duration: '', description: '' }],
    }
  })

  const { fields: eduFields, append: addEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' })
  const { fields: expFields, append: addExp, remove: removeExp } = useFieldArray({ control, name: 'experience' })

  useEffect(() => {
    setLoading(true)
    userApi.getProfile()
      .then(res => {
        const p = res.data.data
        if (p?.skills?.length) setSelectedSkills(p.skills)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const onSubmit = async (data) => {
    setSaveLoading(true)
    try {
      await userApi.updateProfile({
        fullName: data.fullName,
        phone: data.phone,
        branch: data.branch,
        cgpa: parseFloat(data.cgpa) || 0,
        graduationYear: parseInt(data.graduationYear) || 2026,
        linkedinUrl: data.linkedin,
        githubUrl: data.github,
        skills: selectedSkills,
        education: data.education,
        experience: data.experience,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Profile update failed', err)
    } finally {
      setSaveLoading(false)
    }
  }

  const completionPct = Math.round(
    ((step - 1) / steps.length) * 100 + 25
  )

  return (
    <div className="p-8 max-w-3xl">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">My profile</h2>
          <p className="text-gray-500 text-sm mt-1">Complete your profile to unlock all features</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{completionPct}%</p>
          <p className="text-xs text-gray-400">complete</p>
        </div>
      </div>

      {loading && (
        <p className="mb-4 text-sm text-gray-500">Loading profile...</p>
      )}

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${completionPct}%` }}
        />
      </div>

      {/* Step tabs */}
      <div className="flex gap-2 mb-8">
        {steps.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setStep(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              step === id
                ? 'bg-blue-600 text-white'
                : id < step
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {id < step
              ? <CheckCircle size={14} />
              : <Icon size={14} />
            }
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <div className="space-y-5">

            {/* Resume upload */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resume</h3>
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                resumeFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                {resumeFile ? (
                  <>
                    <CheckCircle size={24} className="text-green-500 mb-2" />
                    <p className="text-sm font-medium text-green-700">{resumeFile.name}</p>
                    <p className="text-xs text-green-500 mt-0.5">Click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Upload your resume</p>
                    <p className="text-xs text-gray-400 mt-0.5">PDF only · Max 5MB</p>
                  </>
                )}
              </label>
            </div>

            {/* Personal details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Personal details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('fullName', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                  <input
                    placeholder="10 digit mobile number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('phone')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Roll number</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                    readOnly
                    {...register('rollNumber')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    {...register('branch')}
                  >
                    <option>Computer Science</option>
                    <option>Information Technology</option>
                    <option>Electronics</option>
                    <option>Mechanical</option>
                    <option>Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CGPA</label>
                  <input
                    placeholder="e.g. 8.5"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('cgpa')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Graduation year</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    {...register('graduationYear')}
                  >
                    <option>2025</option>
                    <option>2026</option>
                    <option>2027</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn URL</label>
                  <input
                    placeholder="linkedin.com/in/yourname"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('linkedin')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub URL</label>
                  <input
                    placeholder="github.com/yourname"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('github')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Education */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Education history</h3>
              <button
                type="button"
                onClick={() => addEdu({ degree: '', institution: '', year: '', percentage: '' })}
                className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline"
              >
                <Plus size={14} /> Add more
              </button>
            </div>
            <div className="space-y-4">
              {eduFields.map((field, i) => (
                <div key={field.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Education {i + 1}</p>
                    {i > 0 && (
                      <button type="button" onClick={() => removeEdu(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Degree</label>
                      <input
                        placeholder="B.Tech / 12th / 10th"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register(`education.${i}.degree`)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Institution</label>
                      <input
                        placeholder="College / School name"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register(`education.${i}.institution`)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Year of passing</label>
                      <input
                        placeholder="2026"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register(`education.${i}.year`)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">CGPA / Percentage</label>
                      <input
                        placeholder="8.5 or 85%"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register(`education.${i}.percentage`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Skills */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Technical skills</h3>
            <p className="text-sm text-gray-500 mb-5">Select all skills you are comfortable with</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {allSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">{selectedSkills.length} skills selected:</span>{' '}
                {selectedSkills.join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Step 4 — Experience */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900">Experience & projects</h3>
                <p className="text-sm text-gray-500 mt-0.5">Internships, projects, open source contributions</p>
              </div>
              <button
                type="button"
                onClick={() => addExp({ title: '', company: '', duration: '', description: '' })}
                className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline"
              >
                <Plus size={14} /> Add more
              </button>
            </div>
            <div className="space-y-4">
              {expFields.map((field, i) => (
                <div key={field.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Entry {i + 1}</p>
                    {i > 0 && (
                      <button type="button" onClick={() => removeExp(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Title / Role</label>
                      <input
                        placeholder="Backend Intern / Project"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register(`experience.${i}.title`)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Company / Platform</label>
                      <input
                        placeholder="Google / Personal project"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register(`experience.${i}.company`)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                      <input
                        placeholder="May 2025 — Aug 2025"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register(`experience.${i}.duration`)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="What did you build or contribute? What was the impact?"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      {...register(`experience.${i}.description`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2"
            >
              {saved
                ? <><CheckCircle size={16} /> Saved!</>
                : saveLoading ? 'Saving...' : 'Save profile'
              }
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
