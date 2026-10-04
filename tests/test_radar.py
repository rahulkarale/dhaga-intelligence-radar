"""Tests for Dhaga & Co. Intelligence Radar Pipeline (Compatible with pytest and unittest)."""

import unittest
from radar.data import load_sample_returns
from radar.pipeline import RadarPipeline
from radar.analysis import export_to_csv, calculate_metrics


class TestRadarPipeline(unittest.TestCase):
    def test_load_sample_returns(self):
        returns = load_sample_returns()
        self.assertGreaterEqual(len(returns), 5)
        self.assertEqual(returns[0].sku, "KUR-JPR-402")
        self.assertIn("bust", returns[0].free_text_other_reason.lower())

    def test_pipeline_single_analysis(self):
        pipeline = RadarPipeline()
        sample = load_sample_returns()[0]
        result = pipeline.analyze_single_return(sample)

        self.assertEqual(result.sku, "KUR-JPR-402")
        self.assertGreaterEqual(result.confidence_score, 0.5)
        self.assertGreaterEqual(result.severity_score, 1)

    def test_pipeline_batch_analysis(self):
        pipeline = RadarPipeline()
        samples = load_sample_returns()
        batch_res = pipeline.analyze_batch(samples)

        self.assertEqual(len(batch_res.results), len(samples))
        self.assertGreater(len(batch_res.summary_by_root_cause), 0)
        self.assertGreater(len(batch_res.summary_by_vendor), 0)

    def test_csv_export(self):
        pipeline = RadarPipeline()
        samples = load_sample_returns()
        batch_res = pipeline.analyze_batch(samples)

        csv_data = export_to_csv(batch_res.results)
        self.assertIn("Return ID", csv_data)
        self.assertIn("KUR-JPR-402", csv_data)
        self.assertIn("Translated English Feedback", csv_data)

    def test_metrics_calculation(self):
        pipeline = RadarPipeline()
        samples = load_sample_returns()
        batch_res = pipeline.analyze_batch(samples)

        metrics = calculate_metrics(batch_res.results)
        self.assertGreater(metrics["roi_multiplier"], 50)
        self.assertGreater(metrics["weekly_logistics_saved_inr"], 100000)


if __name__ == "__main__":
    unittest.main()
