import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  attribute: 'class',
  selector: 'html',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'task-manager-theme',
})

export function useTheme() {
  const toggleTheme = useToggle(isDark)
  return { isDark, toggleTheme }
}
