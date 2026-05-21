import { computed, type Ref } from 'vue';

export const useSelectAll = (
  itemsRef: Ref<any[]> | (() => any[]),
  selectedIdsRef: Ref<string[]>,
  idKey: string = '_id'
) => {
  const isAllSelected = computed(() => {
    const items = typeof itemsRef === 'function' ? itemsRef() : itemsRef.value;
    return items.length > 0 && selectedIdsRef.value.length === items.length;
  });

  const toggleSelectAll = (event: Event) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    const items = typeof itemsRef === 'function' ? itemsRef() : itemsRef.value;
    if (isChecked) {
      selectedIdsRef.value = items.map((item: any) => item[idKey]);
    } else {
      selectedIdsRef.value = [];
    }
  };

  return { isAllSelected, toggleSelectAll };
};
