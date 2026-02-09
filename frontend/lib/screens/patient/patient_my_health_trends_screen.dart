import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../services/api_service.dart';

class PatientMyHealthTrendsScreen extends StatefulWidget {
  const PatientMyHealthTrendsScreen({super.key});

  @override
  State<PatientMyHealthTrendsScreen> createState() =>
      _PatientMyHealthTrendsScreenState();
}

class _PatientMyHealthTrendsScreenState
    extends State<PatientMyHealthTrendsScreen> {
  List<dynamic> _visits = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadVisits();
  }

  Future<void> _loadVisits() async {
    try {
      final res = await ApiService().dio.get('/my/visits');
      if (mounted) {
        setState(() {
          _visits = res.data['data'];
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(
          title: Text(
            'My Health Trends',
            style: GoogleFonts.poppins(color: Colors.white),
          ),
          backgroundColor: const Color(0xFF43A047),
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'My Health Trends',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFF43A047), // Green 600
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: _visits.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.trending_up, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text(
                    'No visits recorded yet.',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      color: Colors.grey[500],
                    ),
                  ),
                  Text(
                    'Add visits to see your health trends.',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: Colors.grey[400],
                    ),
                  ),
                ],
              ).animate().fadeIn().scale(),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Summary Card
                  _SummaryCard(
                    visits: _visits,
                  ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.1),
                  const SizedBox(height: 20),

                  // HbA1c Trend Chart
                  _TrendCard(
                    title: 'HbA1c Levels',
                    color: const Color(0xFFFF9800),
                    icon: Icons.trending_up_rounded,
                    visits: _visits,
                    dataExtractor: (visit) =>
                        visit['metrics']['HbA1cLevel'] as num? ?? 0,
                    unit: '%',
                  ).animate().fadeIn(delay: 200.ms).slideX(begin: 0.1),
                  const SizedBox(height: 20),

                  // Glucose Trend Chart
                  _TrendCard(
                    title: 'Blood Glucose Levels',
                    color: const Color(0xFF4CAF50),
                    icon: Icons.water_drop_rounded,
                    visits: _visits,
                    dataExtractor: (visit) =>
                        visit['metrics']['bloodGlucoseLevel'] as num? ?? 0,
                    unit: 'mg/dL',
                  ).animate().fadeIn(delay: 300.ms).slideX(begin: 0.1),
                  const SizedBox(height: 20),

                  // Risk Score Trend Chart
                  _TrendCard(
                    title: 'Overall Risk Score',
                    color: const Color(0xFFE91E63),
                    icon: Icons.health_and_safety_rounded,
                    visits: _visits,
                    dataExtractor: (visit) {
                      final riskScore =
                          visit['prediction']?['riskScore'] as num?;
                      return riskScore != null ? riskScore * 100 : 0;
                    },
                    unit: '%',
                  ).animate().fadeIn(delay: 400.ms).slideX(begin: 0.1),
                  const SizedBox(height: 20),

                  // BMI Trend Chart
                  _TrendCard(
                    title: 'BMI Trends',
                    color: const Color(0xFF9C27B0),
                    icon: Icons.speed_rounded,
                    visits: _visits,
                    dataExtractor: (visit) =>
                        visit['metrics']['bmi'] as num? ?? 0,
                    unit: 'kg/m²',
                  ).animate().fadeIn(delay: 500.ms).slideX(begin: 0.1),

                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }
}

class _TrendCard extends StatefulWidget {
  final String title;
  final Color color;
  final IconData icon;
  final List<dynamic> visits;
  final num Function(dynamic) dataExtractor;
  final String unit;

  const _TrendCard({
    required this.title,
    required this.color,
    required this.icon,
    required this.visits,
    required this.dataExtractor,
    required this.unit,
  });

  @override
  State<_TrendCard> createState() => _TrendCardState();
}

class _TrendCardState extends State<_TrendCard> {
  bool _animate = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) {
        setState(() {
          _animate = true;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // 1. Prepare Data
    final values = widget.visits
        .map((v) => widget.dataExtractor(v).toDouble())
        .toList();

    // Calculate stats securely
    double maxValue = 100;
    double minValue = 0;
    double avgValue = 0;
    double latestValue = 0;
    double highestValue = 0;
    double lowestValue = 0;

    if (values.isNotEmpty) {
      maxValue = values.reduce((a, b) => a > b ? a : b) * 1.2;
      minValue = values.reduce((a, b) => a < b ? a : b) * 0.8;
      var sum = values.reduce((a, b) => a + b);
      avgValue = sum / values.length;
      latestValue = values.last;
      highestValue = values.reduce((a, b) => a > b ? a : b);
      lowestValue = values.reduce((a, b) => a < b ? a : b);
    }

    // Animation Logic
    List<FlSpot> spots;
    if (values.isEmpty) {
      spots = [];
    } else if (!_animate) {
      spots = List.generate(
        values.length,
        (index) => FlSpot(index.toDouble(), minValue * 0.9),
      );
    } else {
      spots = List.generate(
        values.length,
        (index) => FlSpot(index.toDouble(), values[index]),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: widget.color.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: widget.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(widget.icon, color: widget.color, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '${widget.visits.length} visit${widget.visits.length != 1 ? 's' : ''}',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Stats Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _StatColumn(
                'Latest',
                latestValue.toStringAsFixed(1),
                widget.color,
              ),
              _StatColumn('Average', avgValue.toStringAsFixed(1), widget.color),
              _StatColumn(
                'Highest',
                highestValue.toStringAsFixed(1),
                widget.color,
              ),
              _StatColumn(
                'Lowest',
                lowestValue.toStringAsFixed(1),
                widget.color,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Chart
          Container(
            height: 200, // Increased height for better chart visibility
            padding: const EdgeInsets.only(right: 16, top: 10),
            child: values.isEmpty
                ? Center(
                    child: Text(
                      'No data available',
                      style: GoogleFonts.poppins(color: Colors.grey[400]),
                    ),
                  )
                : LineChart(
                    LineChartData(
                      gridData: FlGridData(
                        show: true,
                        drawVerticalLine: false,
                        horizontalInterval: (maxValue - minValue) / 4 > 0
                            ? (maxValue - minValue) / 4
                            : 1.0,
                        getDrawingHorizontalLine: (value) {
                          return FlLine(
                            color: Colors.grey.shade200,
                            strokeWidth: 1,
                          );
                        },
                      ),
                      titlesData: FlTitlesData(
                        show: true,
                        rightTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        topTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 30,
                            interval: (maxValue - minValue) / 4 > 0
                                ? (maxValue - minValue) / 4
                                : 1.0,
                            getTitlesWidget: (value, meta) {
                              if (value == minValue || value == maxValue)
                                return const SizedBox.shrink();
                              return Text(
                                value.toInt().toString(),
                                style: GoogleFonts.poppins(
                                  color: Colors.grey[400],
                                  fontSize: 10,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      minX: 0,
                      maxX: (values.length - 1).toDouble(),
                      minY: minValue * 0.9,
                      maxY: maxValue * 1.1,
                      lineBarsData: [
                        LineChartBarData(
                          spots: spots,
                          isCurved: true,
                          color: widget.color,
                          barWidth: 3,
                          isStrokeCapRound: true,
                          dotData: FlDotData(
                            show: true,
                            getDotPainter: (spot, percent, barData, index) {
                              return FlDotCirclePainter(
                                radius: 4,
                                color: Colors.white,
                                strokeWidth: 2,
                                strokeColor: widget.color,
                              );
                            },
                          ),
                          belowBarData: BarAreaData(
                            show: true,
                            gradient: LinearGradient(
                              colors: [
                                widget.color.withOpacity(0.3),
                                widget.color.withOpacity(0.0),
                              ],
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                            ),
                          ),
                        ),
                      ],
                      lineTouchData: LineTouchData(
                        touchTooltipData: LineTouchTooltipData(
                          tooltipRoundedRadius: 8,
                          getTooltipItems: (touchedSpots) {
                            return touchedSpots.map((LineBarSpot touchedSpot) {
                              return LineTooltipItem(
                                touchedSpot.y.toStringAsFixed(1),
                                TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: GoogleFonts.poppins().fontFamily,
                                ),
                              );
                            }).toList();
                          },
                        ),
                      ),
                    ),
                    duration: const Duration(milliseconds: 1500),
                    curve: Curves.easeOutCubic,
                  ),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              'Unit: ${widget.unit}',
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: Colors.grey[500],
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatColumn extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatColumn(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 60,
      child: Column(
        children: [
          Text(
            label,
            style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600]),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.robotoMono(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: color,
            ),
            overflow: TextOverflow.ellipsis,
            maxLines: 1,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final List<dynamic> visits;

  const _SummaryCard({required this.visits});

  @override
  Widget build(BuildContext context) {
    if (visits.isEmpty) return const SizedBox.shrink();

    final lastVisit = visits.last;
    final riskScore = lastVisit['prediction']?['riskScore'];
    final riskLabel = lastVisit['prediction']?['riskLabel'] ?? 'Unknown';

    Color riskColor = Colors.green;
    IconData riskIcon = Icons.health_and_safety_rounded;

    if (riskLabel == 'High Risk') {
      riskColor = Colors.red;
      riskIcon = Icons.warning_amber_rounded;
    } else if (riskLabel == 'Medium Risk') {
      riskColor = Colors.orange;
      riskIcon = Icons.info_outline_rounded;
    }

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [riskColor, riskColor.withOpacity(0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: riskColor.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Latest Health Status',
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(riskIcon, color: Colors.white, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Risk Status',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    riskLabel,
                    style: GoogleFonts.poppins(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              if (riskScore != null)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Risk Score',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${(riskScore * 100).toStringAsFixed(1)}%',
                      style: GoogleFonts.robotoMono(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.calendar_today_rounded,
                  size: 14,
                  color: Colors.white70,
                ),
                const SizedBox(width: 8),
                Text(
                  'Last assessed: ${lastVisit['visitDate'].toString().split('T')[0]}',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
