import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EditorPage from '../components/EditorPage.vue'

describe('EditorPage', () => {
  it('renders the markdown editor', () => {
    const wrapper = mount(EditorPage)

    // CodeMirror renders a contenteditable div
    const editor = wrapper.find('[contenteditable="true"]')

    expect(editor.exists()).toBe(true)
  })
})
