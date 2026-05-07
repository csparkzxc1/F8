// Four core sliders: exposure, push/pull, shadows, highlights.
// Extra (temperature, tint, grain, etc) live in a secondary tab — Phase 3.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IntensitySlider } from './IntensitySlider';
import { useEditorStore } from '../../store/editorStore';

export function AdjustmentsPanel() {
  const adjustments = useEditorStore((s) => s.adjustments);
  const setAdjustment = useEditorStore((s) => s.setAdjustment);

  return (
    <View style={styles.root}>
      <IntensitySlider
        label="노출"
        value={adjustments.exposure}
        min={-100}
        max={100}
        onChange={(v) => setAdjustment('exposure', v)}
        formatValue={(v) => `${v >= 0 ? '+' : ''}${(v / 100).toFixed(2)}`}
      />
      <IntensitySlider
        label="Push / Pull"
        value={adjustments.pushPull}
        min={-200}
        max={200}
        onChange={(v) => setAdjustment('pushPull', v)}
        formatValue={(v) => `${v >= 0 ? '+' : ''}${(v / 100).toFixed(1)} stop`}
      />
      <IntensitySlider
        label="섀도우"
        value={adjustments.shadows}
        min={-100}
        max={100}
        onChange={(v) => setAdjustment('shadows', v)}
      />
      <IntensitySlider
        label="하이라이트"
        value={adjustments.highlights}
        min={-100}
        max={100}
        onChange={(v) => setAdjustment('highlights', v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 24, paddingVertical: 12, gap: 8 },
});
