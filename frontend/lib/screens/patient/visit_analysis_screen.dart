import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:convert';
import '../../services/api_service.dart';

class VisitAnalysisScreen extends StatefulWidget {
  final List<dynamic> visits;
  final String patientName;

  const VisitAnalysisScreen({
    super.key,
    required this.visits,
    required this.patientName,
  });

  @override
  State<VisitAnalysisScreen> createState() => _VisitAnalysisScreenState();
}

class _VisitAnalysisScreenState extends State<VisitAnalysisScreen> {
  bool _loading = true;
  Map<String, dynamic>? _data;
  String? _error;

  @override
  void initState() {
    super.initState();
    _startAnalysis();
  }

  Future<void> _startAnalysis() async {
    try {
      // 1. Construct Prompt for JSON output
      final sb = StringBuffer();
      sb.writeln(
        "Analyze the following patient visit history for ${widget.patientName} and return strict JSON.",
      );

      // Add simplified visit history (limit to last 3 to ensure response fits in context)
      final recentVisits = widget.visits.take(3).toList();
      for (var v in recentVisits) {
        final date = v['visitDate']?.toString().split('T')[0] ?? 'Unknown';
        final metrics = v['metrics'] ?? {};
        final risk = v['prediction']?['riskLabel'] ?? 'Unknown';
        sb.writeln("- Date: $date, Risk: $risk, Metrics: $metrics");
      }

      sb.write('''
          
Return the response in this EXACT JSON format. Keep the content CONCISE to avoid truncation.
IMPORTANT: Return the JSON as a SINGLE LINE string (minified). Do NOT add newlines.

{
  "intro_text": "Brief greeting & summary (max 2 sentences).",
  "metrics": [{"label": "HbA1c", "value": "10.3%", "status": "danger", "message": "High (max 10 words)"}],
  "advice": [{"category": "Diet", "main_advice": "Eat less sugar", "reason": "Brief reason (max 10 words)"}],
  "next_steps": ["Step 1 (brief)", "Step 2 (brief)"]
}

Ensure there are NO asterisks (*) or markdown symbols.
''');

      // 2. Call API
      final res = await ApiService().dio.post(
        '/ai/chat',
        data: {
          'userMessage': sb.toString(),
          'predictionContext': {
            'patient_name': widget.patientName,
            'task': 'analysis_history_json',
          },
          'chatHistory': [],
        },
      );

      if (mounted) {
        if (res.statusCode == 200 && res.data['success'] == true) {
          final reply = res.data['reply'];

          // Robust JSON extraction: Find first '{' and last '}'
          final startIndex = reply.indexOf('{');
          final endIndex = reply.lastIndexOf('}');

          if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            String cleanJson = reply.substring(startIndex, endIndex + 1);

            // AGGRESSIVE SANITIZATION:
            // 1. Remove all literal newlines (invalid in JSON strings, fine to remove for formatting)
            //    We replace with space to avoid word merging.
            cleanJson = cleanJson.replaceAll('\n', ' ').replaceAll('\r', ' ');

            // 2. Cleanup trailing commas (common LLM error)
            cleanJson = cleanJson.replaceAll(RegExp(r',\s*}'), '}');
            cleanJson = cleanJson.replaceAll(RegExp(r',\s*]'), ']');

            try {
              final decoded = jsonDecode(cleanJson);
              if (decoded is! Map<String, dynamic>) {
                throw const FormatException('JSON root is not an object');
              }
              setState(() {
                _data = decoded;
                _loading = false;
              });
            } catch (e) {
              throw FormatException(
                'Invalid JSON content: $e\nRaw: $cleanJson',
              );
            }
          } else {
            throw const FormatException(
              'Could not find valid JSON object in response',
            );
          }
        } else {
          throw Exception(res.data['message'] ?? 'Failed to analyze');
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error =
              'Failed to analyze data. Please try again.\nError: ${e.toString()}';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Premium Gradient Background
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFF4A148C), // Deep Purple 900
              Color(0xFF7B1FA2), // Purple 700
              Color(0xFFAB47BC), // Purple 400
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildAppBar(context),
              Expanded(
                child: _loading
                    ? _buildLoading()
                    : _error != null
                    ? _buildError()
                    : _buildContent(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AI Health Journey',
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Analyzing ${widget.visits.length} visits',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoading() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.auto_awesome,
                  size: 48,
                  color: Colors.white,
                ),
              )
              .animate(onPlay: (c) => c.repeat())
              .scale(
                begin: const Offset(1, 1),
                end: const Offset(1.2, 1.2),
                duration: 1.seconds,
                curve: Curves.easeInOut,
              )
              .then()
              .scale(
                begin: const Offset(1.2, 1.2),
                end: const Offset(1, 1),
                duration: 1.seconds,
              ),
          const SizedBox(height: 24),
          Text(
            'Analyzing Health Patterns...',
            style: GoogleFonts.poppins(
              fontSize: 18,
              color: Colors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: SingleChildScrollView(
        // Fix overflow
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.white70),
              const SizedBox(height: 16),
              Text(
                'Analysis Failed',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.black26,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  // Truncate error message if too long
                  (_error ?? 'Unknown Error').length > 300
                      ? '${(_error ?? 'Unknown Error').substring(0, 300)}...'
                      : (_error ?? 'Unknown Error'),
                  style: GoogleFonts.sourceCodePro(
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _loading = true;
                    _error = null;
                  });
                  _startAnalysis();
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Retry Analysis'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.purple,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Intro
          Text(
            'Analysis Summary',
            style: GoogleFonts.poppins(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _data?['intro_text'] ?? '',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 16,
              height: 1.5,
            ),
          ).animate().fadeIn().slideY(begin: 0.1),

          const SizedBox(height: 32),

          // Alarming Metrics Row
          if (_data?['metrics'] != null &&
              (_data!['metrics'] as List).isNotEmpty) ...[
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              child: Row(
                children: (_data!['metrics'] as List).map<Widget>((m) {
                  return _buildMetricCard(m);
                }).toList(),
              ),
            ).animate().fadeIn(delay: 200.ms).slideX(begin: 0.2),
            const SizedBox(height: 32),
          ],

          // Split View: Advice & Next Steps
          // On mobile, we stack them.
          _buildSectionHeader('Personalized Advice', Icons.person),
          const SizedBox(height: 16),
          ...(_data?['advice'] as List? ?? []).map((a) => _buildAdviceCard(a)),

          const SizedBox(height: 32),

          _buildSectionHeader('Next Steps', Icons.playlist_add_check),
          const SizedBox(height: 16),
          _buildNextStepsCard(_data?['next_steps'] ?? []),

          const SizedBox(height: 40),
          Center(
            child: OutlinedButton.icon(
              onPressed: () {
                setState(() {
                  _loading = true;
                  _error = null;
                });
                _startAnalysis();
              },
              icon: const Icon(Icons.refresh, color: Colors.white70),
              label: Text(
                'Re-analyze',
                style: GoogleFonts.poppins(color: Colors.white),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.white30),
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: Colors.white, size: 20),
        const SizedBox(width: 10),
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildMetricCard(Map<String, dynamic> metric) {
    Color bg;
    Color text;
    IconData icon;

    switch (metric['status']) {
      case 'danger':
        bg = const Color(0xFFFF5252);
        text = Colors.white;
        icon = Icons.warning_rounded;
        break;
      case 'warning':
        bg = const Color(0xFFFFB74D);
        text = Colors.black87;
        icon = Icons.priority_high_rounded;
        break;
      default:
        bg = const Color(0xFF66BB6A);
        text = Colors.white;
        icon = Icons.check_circle_outline;
    }

    return Container(
      width: 260,
      margin: const EdgeInsets.only(right: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black12,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: text.withOpacity(0.8), size: 20),
              ),
              Expanded(
                child: Text(
                  metric['label'],
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: text.withOpacity(0.9),
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            metric['value'],
            style: GoogleFonts.poppins(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: text,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            metric['message'],
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: text.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdviceCard(Map<String, dynamic> advice) {
    IconData icon;
    Color color;

    final cat = advice['category'].toString().toLowerCase();
    if (cat.contains('diet')) {
      icon = Icons.restaurant;
      color = Colors.orange;
    } else if (cat.contains('exercise')) {
      icon = Icons.directions_run;
      color = Colors.blue;
    } else {
      icon = Icons.nightlight_round;
      color = Colors.purple;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(
          0xFF311B92,
        ).withOpacity(0.5), // Semi-transparent card
        borderRadius: BorderRadius.circular(16),
        border: Border(left: BorderSide(color: color, width: 4)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    advice['category'].toString().toUpperCase(),
                    style: GoogleFonts.poppins(
                      color: color,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      letterSpacing: 1,
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              advice['main_advice'],
              style: GoogleFonts.poppins(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.arrow_right_alt, color: Colors.white54, size: 16),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    advice['reason'],
                    style: GoogleFonts.poppins(
                      color: Colors.white70,
                      fontSize: 13,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn().slideY(begin: 0.1);
  }

  Widget _buildNextStepsCard(List<dynamic> steps) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: steps.map<Widget>((step) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.check_circle,
                  color: Colors.greenAccent,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    step.toString(),
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    ).animate().fadeIn().slideY(begin: 0.2);
  }
}
