import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class PatientChatScreen extends StatefulWidget {
  const PatientChatScreen({super.key});

  @override
  State<PatientChatScreen> createState() => _PatientChatScreenState();
}

class _PatientChatScreenState extends State<PatientChatScreen> {
  final TextEditingController _msgController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isTyping = false;

  // Context Data
  Map<String, dynamic>? _healthStats;
  String _patientName = '';

  @override
  void initState() {
    super.initState();
    _loadContext();
    // specific initial greeting
    _messages.add({
      'role': 'ai',
      'text':
          'Hello! I\'m your personal Health Assistant. I have access to your latest health records. How can I help you today?',
      'time': DateTime.now(),
    });
  }

  Future<void> _loadContext() async {
    // 1. Get User Name
    final auth = Provider.of<AuthProvider>(context, listen: false);
    _patientName = auth.user?['name'] ?? 'Patient';

    // 2. Fetch Latest Visit / Health Stats
    // This connects to your existing API to get real context
    try {
      // Use /my/visits endpoint for patient's own data
      final res = await ApiService().dio.get('/my/visits');
      final visits = res.data['data'] as List;
      if (visits.isNotEmpty) {
        _healthStats = visits.last; // Get the most recent visit
      }
    } catch (e) {
      debugPrint('Error fetching context: $e');
    }
  }

  void _sendMessage() {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;

    // 1. Add User Message
    setState(() {
      _messages.add({'role': 'user', 'text': text, 'time': DateTime.now()});
      _msgController.clear();
      _isTyping = true;
    });
    _scrollToBottom();

    // 2. Simulate AI Processing / Call API
    _getAIResponse(text);
  }

  Future<void> _getAIResponse(String userText) async {
    try {
      // 1. Prepare Chat History
      // Convert UI messages to API format (exclude the one just added locally if needed,
      // but usually we want history *before* the current message.
      // The current message is passed explicitly as `userMessage`.
      // So we take everything from `_messages` except the last one (which is the user's current message).
      // Wait, `_sendMessage` adds the user message to `_messages` BEFORE calling `_getAIResponse`.
      // So `_messages` contains the current message at the end.
      // The API expects `chatHistory` separately. We should exclude the last message.

      final history = _messages.take(_messages.length - 1).map((m) {
        return {
          'role': m['role'] == 'user' ? 'user' : 'assistant',
          'content': m['text'],
        };
      }).toList();

      // 2. Prepare Context - Must match Python ML service expectations
      // Extract risk score and prediction values from last visit
      final prediction = _healthStats?['prediction'];
      double? riskScore = prediction?['riskScore'] as double?;
      double riskPercent = riskScore != null ? (riskScore * 100) : 0.0;

      // Determine prediction value (1 = high risk, 0 = low risk)
      int predictionValue = 0;
      if (prediction != null) {
        final riskLabel =
            prediction['riskLabel']?.toString().toLowerCase() ?? '';
        if (riskLabel.contains('high')) {
          predictionValue = 1;
        }
      }

      // Get metrics from the last visit
      final metrics = _healthStats?['metrics'] ?? {};

      final contextData = {
        'patient_name': _patientName,
        'prediction': predictionValue, // Required by ML service
        'risk_percent': riskPercent,
        'patient_data': {
          // Full patient data for AI context
          'name': _patientName,
          'HbA1c_level': metrics['HbA1cLevel'],
          'blood_glucose_level': metrics['bloodGlucoseLevel'],
          'bmi': metrics['bmi'],
          'hypertension': metrics['hypertension'],
          'heart_disease': metrics['heartDisease'],
          'smoking_history': metrics['smokingHistory'],
          'age': metrics['age'],
          'gender': metrics['gender'],
        },
        'metrics': metrics, // Also include raw metrics
        'latest_visit_date':
            _healthStats?['visitDate'] ?? DateTime.now().toIso8601String(),
      };

      // 3. Call API
      // Backend route is likely /ai/chat based on standard conventions (api/ai/chat)
      final res = await ApiService().dio.post(
        '/ai/chat',
        data: {
          'userMessage': userText,
          'predictionContext': contextData,
          'chatHistory': history,
        },
      );

      if (!mounted) return;

      // 4. Handle Response
      if (res.statusCode == 200 && res.data['success'] == true) {
        final reply = res.data['reply'];
        setState(() {
          _isTyping = false;
          _messages.add({'role': 'ai', 'text': reply, 'time': DateTime.now()});
        });
        _scrollToBottom();
      } else {
        throw Exception(res.data['message'] ?? 'Unknown error from AI service');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isTyping = false;
        _messages.add({
          'role': 'ai',
          'text':
              "I'm having trouble connecting to the server right now. Please try again later.",
          'time': DateTime.now(),
        });
      });
      _scrollToBottom();

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
      debugPrint('AI Chat Error: $e');
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F8E9), // Light Green bg
      appBar: AppBar(
        backgroundColor: const Color(0xFF2E7D32),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.smart_toy_rounded,
                size: 20,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Health Assistant',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Powered by AI',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () {
              // Maybe clear chat or show info
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Chat history cleared temporarily.'),
                ),
              );
              setState(() {
                _messages.clear();
                _messages.add({
                  'role': 'ai',
                  'text': 'History cleared. How can I help?',
                  'time': DateTime.now(),
                });
              });
            },
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: Column(
        children: [
          // Chat List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isTyping) {
                  return _buildTypingIndicator();
                }
                final msg = _messages[index];
                final isUser = msg['role'] == 'user';
                return _buildMessageBubble(msg, isUser);
              },
            ),
          ),

          // Input Area
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    onPressed: () {
                      // TODO: Attach records functionality
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Auto-fetching your latest records...'),
                        ),
                      );
                    },
                    icon: const Icon(
                      Icons.add_circle_outline,
                      color: Color(0xFF2E7D32),
                    ),
                  ),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F8E9),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: TextField(
                        controller: _msgController,
                        textCapitalization: TextCapitalization.sentences,
                        decoration: InputDecoration(
                          hintText: 'Ask about your health...',
                          hintStyle: GoogleFonts.poppins(
                            color: Colors.grey[500],
                            fontSize: 14,
                          ),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 14,
                          ),
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFF2E7D32),
                    ),
                    child: IconButton(
                      icon: const Icon(
                        Icons.send_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                      onPressed: _sendMessage,
                    ),
                  ).animate(target: 1).scale(curve: Curves.elasticOut),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> msg, bool isUser) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16, left: 8, right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isUser ? const Color(0xFF2E7D32) : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: isUser
                ? const Radius.circular(20)
                : const Radius.circular(4),
            bottomRight: isUser
                ? const Radius.circular(4)
                : const Radius.circular(20),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              msg['text'],
              style: GoogleFonts.poppins(
                color: isUser ? Colors.white : const Color(0xFF333333),
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _formatTime(msg['time']),
              style: GoogleFonts.poppins(
                color: isUser ? Colors.white70 : Colors.grey[400],
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16, left: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 12,
              height: 12,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation(Color(0xFF2E7D32)),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Thinking...',
              style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    ).animate().fadeIn();
  }

  String _formatTime(DateTime time) {
    return "${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}";
  }
}
