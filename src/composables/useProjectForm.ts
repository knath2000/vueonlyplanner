import { ref, watch, computed, type Ref } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import type { Project, ProjectData } from '@/types/project'

// Define available colors (consider moving this to a shared config/util if used elsewhere)
const availableColors = ref([
  { name: 'Purple', value: '#7e57ff', class: 'swatch-purple' },
  { name: 'Teal', value: '#3dccc7', class: 'swatch-teal' },
  { name: 'Orange', value: '#ff7043', class: 'swatch-orange' },
  { name: 'Yellow', value: '#ffca28', class: 'swatch-yellow' },
  { name: 'Green', value: '#66bb6a', class: 'swatch-green' },
  { name: 'Red', value: '#ef5350', class: 'swatch-red' },
  { name: 'Blue', value: '#29b6f6', class: 'swatch-blue' },
  { name: 'Grey', value: '#a0a0a0', class: 'swatch-grey' },
])

// Define the shape of the returned value
interface UseProjectFormReturn {
  projectData: Ref<ProjectData>
  loading: Ref<boolean>
  error: Ref<string | null>
  availableColors: Ref<typeof availableColors.value>
  isEditing: Ref<boolean>
  resetForm: () => void
  submitForm: () => Promise<string | null> // Returns new/updated project ID on success, null on failure
}

export function useProjectForm(initialProject?: Ref<Project | null>): UseProjectFormReturn {
  const projectStore = useProjectStore()

  const defaultProjectData: ProjectData = {
    name: '',
    color: availableColors.value[0].value, // Default to first color
  }

  // Reactive state for the form data
  const projectData = ref<ProjectData>({ ...defaultProjectData })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Determine if we are in edit mode
  const isEditing = computed(() => !!initialProject?.value)

  // Function to reset the form
  const resetForm = () => {
    if (isEditing.value && initialProject?.value) {
      projectData.value = {
        name: initialProject.value.name,
        color: initialProject.value.color,
      }
    } else {
      projectData.value = { ...defaultProjectData }
    }
    error.value = null
    loading.value = false
  }

  // Watch the initialProject prop to update the form when it changes (for editing)
  watch(
    initialProject || ref(null),
    (newProject) => {
      if (newProject) {
        resetForm()
      } else {
        projectData.value = { ...defaultProjectData }
        error.value = null
      }
    },
    { immediate: true, deep: true },
  )

  // Function to handle form submission (Add or Edit)
  const submitForm = async (): Promise<string | null> => {
    if (!projectData.value.name.trim()) {
      error.value = 'Project name is required.'
      return null
    }

    loading.value = true
    error.value = null

    try {
      let resultProjectId: string | null = null
      if (isEditing.value && initialProject?.value) {
        // --- Edit Project ---
        // Ensure projectStore has an updateProject method similar to taskStore
        // Assuming updateProject exists and returns boolean/void or throws error
        await projectStore.updateProject(initialProject.value.id, { ...projectData.value })
        if (!projectStore.error) {
          resultProjectId = initialProject.value.id // Return existing ID on successful update
        }
      } else {
        // --- Add Project ---
        // Assuming addProject returns the new project ID or null on failure
        resultProjectId = await projectStore.addProject({ ...projectData.value })
      }

      loading.value = false

      if (projectStore.error) {
        error.value = projectStore.error
        return null // Indicate failure
      } else {
        return resultProjectId // Return ID on success
      }
    } catch (err) {
      console.error(`Failed to ${isEditing.value ? 'update' : 'add'} project:`, err)
      loading.value = false
      error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      return null // Indicate failure
    }
  }

  return {
    projectData,
    loading,
    error,
    availableColors, // Expose colors for the picker
    isEditing,
    resetForm,
    submitForm,
  }
}
