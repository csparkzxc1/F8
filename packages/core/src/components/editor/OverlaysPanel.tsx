// [오버레이] tab: per-frame surface effects layered on top of LUT+adjustments.
// Each slider writes straight into the editor store; FilteredImage's shader
// chain reads back via buildUniforms.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IntensitySlider } from './IntensitySlider';
import { useEditorStore } from '../../store/editorStore';

export function OverlaysPanel() {
  const adjustments = useEditorStore((s) => s.adjustments);
  const setAdjustment = useEditorStore((s) => s.setAdjustment);

  return (
    <View style={styles.root}>
      <IntensitySlider
        label="그레인"
        value={adjustments.grain}
        min={0}
        max={100}
        onChange={(v) => setAdjustment('grain', v)}
      />
      <IntensitySlider
        label="비네팅"
        value={adjustments.vignette}
        min={0}
        max={100}
        onChange={(v) => setAdjustment('vignette', v)}
      />
      <IntensitySlider
        label="라이트릭"
        value={adjustments.lightLeak}
        min={0}
        max={100}
        onChange={(v) => setAdjustment('lightLeak', v)}
      />
      <IntensitySlider
        label="Halation"
        value={adjustments.halation}
        min={0}
        max={100}
        onChange={(v) => setAdjustment('halation', v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 24, paddingVertical: 12, gap: 8 },
});
