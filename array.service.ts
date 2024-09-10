export function removeDuplicateElementsFromArray<ArrayElementType>(array: Array<ArrayElementType>): Array<ArrayElementType> {
	return array.filter((item, index) => array.indexOf(item) === index);
}
